/**
 * Marvel Super Heroes Commander (MSC), batch 74, part b (2026-10-14): the rest of the set.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  attack,
  cast,
  counters,
  enter,
  hand,
  lands,
  life,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  named,
  watchTargets,
  zone,
} from "./harness.js";

const castOffers = (game: Game, card: ObjectId) =>
  game.legalActions(A).filter((o) => o.kind === "cast-spell" && o.card === card);

/** `by` casts Shock at `to` — 2 noncombat damage from a source `by` controls. */
const shock = (game: Game, to: PlayerId | ObjectId, by: PlayerId = A): void => {
  lands(game, "Mountain", 1, by);
  cast(game, toHand(game, "Shock", by), { player: by, targets: [ref(to)] });
};

describe("Shuri, Vibranium Technologist", () => {
  it("makes a 1/1 flying Robot Hero artifact creature token, or draws a card", () => {
    const { game, a } = table();
    pickModes(a, 0);
    enter(game, "Shuri, Vibranium Technologist");
    expect(tokensNamed(game, "1/1 Robot Hero Token", A)).toBe(1);
    const robot = named(game, "1/1 Robot Hero Token", A)[0];
    expect(pt(game, robot)).toEqual({ power: 1, toughness: 1 });

    const before = hand(game).length;
    pickModes(a, 1);
    enter(game, "Shuri, Vibranium Technologist");
    expect(hand(game)).toHaveLength(before + 1);
    expect(tokensNamed(game, "1/1 Robot Hero Token", A)).toBe(1);
  });
});

describe("Victor Timely, Wily Tycoon", () => {
  it("can't target a creature card or one with mana value 5", () => {
    const { game, a } = table();
    toGraveyard(game, "HYDRA Disintegrator"); // mana value 5
    toGraveyard(game, "Grizzly Bears"); // a creature card
    const seen = watchTargets(a);
    let offered = 0;
    a.chooseCastNowFn = () => {
      offered += 1;
      return null;
    };
    enter(game, "Victor Timely, Wily Tycoon");
    expect(seen.asked).toBe(0);
    expect(offered).toBe(0);
    expect(game.state.zones.shared.stack).toHaveLength(0);
  });

  it("casts an artifact card free from your graveyard onto the battlefield", () => {
    const { game, a } = table();
    const ring = toGraveyard(game, "Sol Ring");
    toGraveyard(game, "HYDRA Disintegrator");
    a.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts.find((c) => c.card === ring);
      if (way === undefined) return null;
      return { type: "cast-spell", player: A, card: ring, targets: [], via: way.via, ...(offer.free ? { free: true } : {}) };
    };
    enter(game, "Victor Timely, Wily Tycoon");
    // An artifact resolves onto the battlefield; the exile replacement is the spell's only.
    expect(zone(game, ring)).toBe("battlefield");
  });

  it("exiles an instant cast this way as it resolves", () => {
    const { game, a } = table();
    const bolt = toGraveyard(game, "Lightning Bolt");
    pickTargets(a, bolt);
    a.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts.find((c) => c.card === bolt)!;
      return { type: "cast-spell", player: A, card: bolt, targets: [ref(B)], via: way.via, ...(offer.free ? { free: true } : {}) };
    };
    enter(game, "Victor Timely, Wily Tycoon");
    expect(life(game, B)).toBe(17);
    expect(zone(game, bolt)).toBe("exile");
  });
});

describe("Molten Lavamancer", () => {
  it("makes one Elemental the first time a source you control deals noncombat damage to an opponent on your turn, and not for combat damage", () => {
    const { game, a } = table();
    spawn(game, "Molten Lavamancer");
    shock(game, B);
    expect(tokensNamed(game, "1/1 Red Elemental Token", A)).toBe(1);
    shock(game, B);
    expect(tokensNamed(game, "1/1 Red Elemental Token", A)).toBe(1);

    // Alice's next turn: combat damage doesn't count.
    toStep(game, "precombat-main");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(14);
    expect(tokensNamed(game, "1/1 Red Elemental Token", A)).toBe(1);
  });

  it("doesn't trigger during an opponent's turn", () => {
    const { game } = table();
    const lavamancer = spawn(game, "Molten Lavamancer");
    const ping = (): void => {
      game.debugApplyEffect(A, { kind: "damage", amount: 1, target: 0 }, [ref(B)], { source: lavamancer });
      settle(game);
    };
    toStep(game, "precombat-main", B);
    ping();
    expect(life(game, B)).toBe(19);
    expect(tokensNamed(game, "1/1 Red Elemental Token", A)).toBe(0);
    // The same damage on alice's turn does.
    toStep(game, "precombat-main", A);
    ping();
    expect(tokensNamed(game, "1/1 Red Elemental Token", A)).toBe(1);
  });
});

describe("Beast Mode", () => {
  it("puts a +1/+1 counter on the creature only when cast using teamwork", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const bears = spawn(game, "Grizzly Bears");
    const helper = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Beast Mode"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(counters(game, bears)).toBe(0);
    cast(game, toHand(game, "Beast Mode"), { targets: [ref(bears)], kicked: true, tap: [helper] });
    expect(counters(game, bears)).toBe(1);
    expect(pt(game, bears)).toEqual({ power: 7, toughness: 7 });
  });
});

describe("Inspired Fire", () => {
  it("costs {1} less for each card you've drawn this turn", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const fire = toHand(game, "Inspired Fire");
    expect(castOffers(game, fire)).toHaveLength(0);
    game.debugApplyEffect(A, { kind: "draw", amount: 2 }, []);
    settle(game);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, fire, { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Fall to Earth", () => {
  it("exiles the creature and each player gains 3 life", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    const giant = spawn(game, "Hill Giant", B);
    cast(game, toHand(game, "Fall to Earth"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("exile");
    expect(life(game, A)).toBe(23);
    expect(life(game, B)).toBe(23);
  });
});

describe("Wasp, Shrinking Savior", () => {
  it("shrinks another creature until your next turn, then draws a card for each creature with power less than 0", () => {
    const { game, a } = table();
    const wasp = spawn(game, "Wasp, Shrinking Savior");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    const before = hand(game).length;
    attack(game, a, [wasp]);
    expect(pt(game, bears)).toEqual({ power: -1, toughness: 2 });
    expect(hand(game)).toHaveLength(before + 1);
    toStep(game, "precombat-main", B);
    expect(pt(game, bears)).toEqual({ power: -1, toughness: 2 });
  });
});

describe("Ms. Marvel, Elastic Ally", () => {
  it("draws once a turn when a creature with power above its base power deals combat damage to a player", () => {
    const { game, a } = table();
    const marvel = spawn(game, "Ms. Marvel, Elastic Ally");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const before = hand(game).length;
    // Unpumped: no draw.
    attack(game, a, [marvel]);
    expect(hand(game)).toHaveLength(before);

    toStep(game, "precombat-main");
    const handNow = hand(game).length; // the turn's draw
    game.debugApplyEffect(A, { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" }, [ref(bears)]);
    game.debugApplyEffect(A, { kind: "modify-pt", target: 0, power: 1, toughness: 0, duration: "end-of-turn" }, [ref(giant)]);
    attack(game, a, [bears, giant]);
    expect(hand(game)).toHaveLength(handNow + 1);
  });
});

describe("The Wasp, Janet Van Dyne", () => {
  it("can target only a tapped creature an opponent controls", () => {
    const { game } = table();
    const tapped = spawn(game, "Hill Giant", B, { tapped: true });
    const untapped = spawn(game, "Grizzly Bears", B);
    const mine = spawn(game, "Grizzly Bears", A, { tapped: true });
    enter(game, "The Wasp, Janet Van Dyne");
    expect(zone(game, tapped)).toBe("graveyard");
    expect(zone(game, untapped)).toBe("battlefield");
    expect(zone(game, mine)).toBe("battlefield");
  });
});

describe("Bionic Blow", () => {
  it("pumps your creature by X, then it deals damage equal to its power to another creature and takes none back", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const bears = spawn(game, "Grizzly Bears");
    const angel = spawn(game, "Serra Angel", B);
    cast(game, toHand(game, "Bionic Blow"), { targets: [ref(bears), ref(angel)], x: 2 });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
    expect(zone(game, angel)).toBe("graveyard");
    expect(game.state.objects[bears].damageMarked).toBe(0);
  });
});

describe("Sky Cycle", () => {
  it("deals twice the number of Vehicles you control to up to one target creature", () => {
    const { game, a } = table();
    spawn(game, "Smuggler's Copter");
    const angel = spawn(game, "Serra Angel", B); // 4/4
    pickTargets(a, angel);
    enter(game, "Sky Cycle");
    expect(zone(game, angel)).toBe("graveyard");
  });
});

describe("HYDRA Disintegrator", () => {
  it("makes a 2/1 menace Villain and attaches to it", () => {
    const { game } = table();
    const disintegrator = enter(game, "HYDRA Disintegrator");
    const villain = named(game, "Villain Token", A)[0];
    expect(villain).toBeDefined();
    expect(game.state.objects[disintegrator].attachedTo).toBe(villain);
    expect(pt(game, villain)).toEqual({ power: 5, toughness: 4 });
  });
});

describe("Soldier On", () => {
  it("puts two +1/+1 counters on the creature and untaps it", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    cast(game, toHand(game, "Soldier On"), { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(2);
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});

describe("Captain America's Motorcycle", () => {
  it("can pump an uncrewed Vehicle — itself included", () => {
    const { game } = table();
    // Its only legal target: no creature on the battlefield.
    const bike = enter(game, "Captain America's Motorcycle");
    expect(pt(game, bike)).toEqual({ power: 5, toughness: 1 });
  });
});

describe("Mockingbird, Bobbi Morse", () => {
  it("gets a +1/+1 counter when she's dealt damage and survives", () => {
    const { game } = table();
    const bird = spawn(game, "Mockingbird, Bobbi Morse");
    shock(game, bird);
    expect(counters(game, bird)).toBe(1);
  });
});

describe("Contract Hero", () => {
  it("gets +2/+0 when it sacrifices an artifact as it attacks, and not when declined", () => {
    const { game, a } = table();
    const hero = enter(game, "Contract Hero");
    const treasure = named(game, "Treasure Token", A)[0];
    expect(treasure).toBeDefined();
    pickModes(a, 0);
    pickPermanents(a, treasure);
    a.declareAttackersFn = () => [{ attacker: hero, defender: B }];
    toStep(game, "declare-attackers");
    settle(game);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);
    expect(pt(game, hero)).toEqual({ power: 4, toughness: 3 });
  });

  it("doesn't get +2/+0 when declined", () => {
    const { game, a } = table();
    const hero = enter(game, "Contract Hero");
    pickModes(a);
    a.declareAttackersFn = () => [{ attacker: hero, defender: B }];
    toStep(game, "declare-attackers");
    settle(game);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    expect(pt(game, hero)).toEqual({ power: 2, toughness: 3 });
  });
});

describe("Heroic Teamwork", () => {
  it("pumps one or two creatures, and draws a card only when cast using teamwork", () => {
    const { game } = table();
    lands(game, "Plains", 6);
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const before = hand(game).length;
    cast(game, toHand(game, "Heroic Teamwork"), { targets: [ref(bears), null] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 3 });
    expect(hand(game)).toHaveLength(before);
    cast(game, toHand(game, "Heroic Teamwork"), { targets: [ref(bears), ref(giant)], kicked: true, tap: [giant] });
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 4 });
    expect(pt(game, giant)).toEqual({ power: 5, toughness: 4 });
    expect(hand(game)).toHaveLength(before + 1);
  });
});

describe("Nighthawk, Dark Defender", () => {
  it("triggers on itself and another Hero entering, not on a non-Hero", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    enter(game, "Nighthawk, Dark Defender");
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    enter(game, "Mockingbird, Bobbi Morse"); // a Hero
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    enter(game, "Hill Giant");
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});
