/**
 * Set walk batch 92, part a (2026-10-16): The Lost Caverns of Ixalan (LCI) and The Lost Caverns of Ixalan Commander (LCC), whole sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";

import {
  A,
  B,
  C,
  attack,
  cast,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

const tokensOf = (game: Game, name: string, player: PlayerId = A): ObjectId[] =>
  named(game, name, player).filter((id) => game.state.objects[id].isToken === true);
const makeToken = (game: Game, name: string, player: PlayerId = A): void =>
  game.debugApplyEffect(player, { kind: "create-token", token: name, count: 1 });
/** Mill a permanent card off the top of alice's library: she descended. */
const descend = (game: Game): ObjectId => {
  const card = toLibrary(game, "Grizzly Bears");
  game.debugApplyEffect(A, { kind: "mill", target: "you", amount: 1 });
  settle(game);
  return card;
};

describe("Promise of Aclazotz // Foul Rebirth", () => {
  it("Foul Rebirth sacrifices a non-Demon creature for a 4/3 Vampire Demon; Promise populates at your end step", () => {
    const { game, a } = table();
    lands(game, "Swamp", 5);
    const bears = spawn(game, "Grizzly Bears");
    const card = toHand(game, "Promise of Aclazotz");
    cast(game, card, { face: 1 });
    expect(zone(game, bears)).toBe("graveyard");
    expect(tokensOf(game, "Vampire Demon Token")).toHaveLength(1);
    expect(zone(game, card)).toBe("exile");
    cast(game, card, { via: "adventure", face: 0 });
    expect(zone(game, card)).toBe("battlefield");

    const giant = spawn(game, "Hill Giant");
    const elves = spawn(game, "Llanowar Elves");
    pickModes(a, 0);
    let offered: readonly ObjectId[] = [];
    a.chooseSacrificesFn = (_view, eligible) => {
      offered = eligible;
      return [giant];
    };
    toStep(game, "end");
    settle(game);
    // A Demon isn't offered.
    expect([...offered].sort()).toEqual([giant, elves].sort());
    expect(zone(game, giant)).toBe("graveyard");
    expect(tokensOf(game, "Vampire Demon Token")).toHaveLength(2);
  });

  it("Foul Rebirth makes nothing when only a Demon could be sacrificed", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    makeToken(game, "Vampire Demon Token");
    const card = toHand(game, "Promise of Aclazotz");
    cast(game, card, { face: 1 });
    expect(tokensOf(game, "Vampire Demon Token")).toHaveLength(1);
  });

  it("Promise's sacrifice is a may: declined, nothing is populated", () => {
    const { game, a } = table();
    spawn(game, "Promise of Aclazotz");
    const giant = spawn(game, "Hill Giant");
    makeToken(game, "Vampire Demon Token");
    pickModes(a);
    toStep(game, "end");
    settle(game);
    expect(zone(game, giant)).toBe("battlefield");
    expect(tokensOf(game, "Vampire Demon Token")).toHaveLength(1);
  });
});

describe("Dusk Legion Sergeant", () => {
  it("gives each nontoken Vampire you control persist until end of turn — not tokens, not others", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const sergeant = spawn(game, "Dusk Legion Sergeant");
    const nighthawk = spawn(game, "Vampire Nighthawk");
    makeToken(game, "Vampire Token");
    const token = tokensOf(game, "Vampire Token")[0];
    const bears = spawn(game, "Grizzly Bears");
    game.dispatch({ type: "activate-ability", player: A, source: sergeant, abilityIndex: 0, targets: [] });
    settle(game);
    expect(zone(game, sergeant)).toBe("graveyard");
    // One that arrives afterwards doesn't gain it (rule 611.2c).
    const late = spawn(game, "Vampire Nighthawk");
    for (const id of [nighthawk, token, bears, late]) destroy(game, id);
    settle(game);
    const back = named(game, "Vampire Nighthawk", A).filter((id) => zone(game, id) === "battlefield");
    expect(back).toHaveLength(1);
    expect(counters(game, back[0], "-1/-1")).toBe(1);
    expect(zone(game, late)).toBe("graveyard");
    expect(tokensOf(game, "Vampire Token")).toHaveLength(0);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Tributary Instructor", () => {
  it("mentors a lesser attacker, and draws when a creature with a +1/+1 counter dies", () => {
    const { game, a } = table();
    const instructor = spawn(game, "Tributary Instructor");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [instructor, bears]);
    expect(counters(game, bears)).toBe(1);
    const before = hand(game).length;
    const plain = spawn(game, "Hill Giant");
    destroy(game, plain);
    settle(game);
    expect(hand(game).length).toBe(before);
    destroy(game, bears);
    settle(game);
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("From the Rubble", () => {
  it("returns only a creature card of the chosen type at your end step, with a finality counter", () => {
    const { game, a } = table();
    lands(game, "Plains", 6);
    a.chooseCreatureTypeFn = () => "Bear";
    const bears = toGraveyard(game, "Grizzly Bears");
    const other = toGraveyard(game, "Runeclaw Bear");
    const giant = toGraveyard(game, "Hill Giant");
    cast(game, toHand(game, "From the Rubble"));
    const seen = watchTargets(a, () => [bears]);
    toStep(game, "end");
    settle(game);
    expect([...seen.offered[0]].sort()).toEqual([bears, other].sort());
    expect(zone(game, bears)).toBe("battlefield");
    expect(counters(game, bears, "finality")).toBe(1);
    expect(zone(game, giant)).toBe("graveyard");
  });
});

describe("Bygone Marvels", () => {
  it("with eight permanent cards in your graveyard, copies itself twice — three returns — and exiles itself", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const cards = ["Grizzly Bears", "Hill Giant", "Llanowar Elves"].map((n) => toGraveyard(game, n));
    for (let i = 0; i < 5; i++) toGraveyard(game, "Wastes");
    const queue = [cards[1], cards[2]];
    a.chooseTargetsFn = () => [ref(queue.shift() ?? cards[0])];
    const marvels = toHand(game, "Bygone Marvels");
    cast(game, marvels, { targets: [ref(cards[0])] });
    for (const id of cards) expect(zone(game, id)).toBe("hand");
    expect(zone(game, marvels)).toBe("exile");
  });

  it("with seven, isn't copied", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    for (let i = 0; i < 5; i++) toGraveyard(game, "Wastes");
    toGraveyard(game, "Lightning Bolt");
    const marvels = toHand(game, "Bygone Marvels");
    cast(game, marvels, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, marvels)).toBe("exile");
  });
});

describe("Order of Sacred Dusk", () => {
  it("other Vampires you control have exalted: each instance triggers", () => {
    const { game, a } = table();
    spawn(game, "Order of Sacred Dusk");
    spawn(game, "Vampire Nighthawk");
    spawn(game, "Hill Giant");
    spawn(game, "Vampire Nighthawk", B);
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    // Order's own exalted and the Nighthawk's: +2/+2.
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Confounding Riddle", () => {
  it("looks at four, one into the hand and the rest into the graveyard", () => {
    const { game, a } = table();
    lands(game, "Island", 3);
    const picked = toLibrary(game, "Hill Giant");
    toLibrary(game, "Grizzly Bears");
    pickFromZone(a, picked);
    const before = graveyard(game).length;
    cast(game, toHand(game, "Confounding Riddle"), { modes: [0] });
    expect(zone(game, picked)).toBe("hand");
    // Three looked-at cards, and the Riddle itself.
    expect(graveyard(game).length).toBe(before + 4);
  });

  it("counters a spell whose controller can't pay {4}", () => {
    const { game } = table();
    lands(game, "Island", 3);
    lands(game, "Forest", 2);
    const bears = toHand(game, "Grizzly Bears");
    cast(game, bears, { settle: false });
    cast(game, toHand(game, "Confounding Riddle"), { modes: [1], targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Hunter's Blowgun", () => {
  it("+1/+1, deathtouch during your turn and reach otherwise", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const blowgun = spawn(game, "Hunter's Blowgun");
    const bears = spawn(game, "Grizzly Bears");
    game.dispatch({ type: "activate-ability", player: A, source: blowgun, abilityIndex: 0, targets: [ref(bears)] });
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("deathtouch")).toBe(true);
    expect(keywords(game, bears).has("reach")).toBe(false);
    toStep(game, "upkeep", B);
    expect(keywords(game, bears).has("deathtouch")).toBe(false);
    expect(keywords(game, bears).has("reach")).toBe(true);
  });
});

describe("Zoyowa Lava-Tongue", () => {
  it("doesn't trigger unless you descended this turn", () => {
    const { game } = table();
    spawn(game, "Zoyowa Lava-Tongue");
    toStep(game, "end");
    settle(game);
    expect(life(game, B)).toBe(20);
  });

  it("each opponent may discard or sacrifice; Zoyowa deals 3 to each who didn't", () => {
    const { game, b, c } = table({ players: 3 });
    spawn(game, "Zoyowa Lava-Tongue");
    descend(game);
    const handB = hand(game, B).length;
    pickModes(b, 0);
    pickModes(c);
    toStep(game, "end");
    settle(game);
    expect(hand(game, B).length).toBe(handB - 1);
    expect(life(game, B)).toBe(20);
    expect(life(game, C)).toBe(17);
  });
});

describe("Poetic Ingenuity", () => {
  it("makes a Treasure per attacking Dinosaur, once per attack", () => {
    const { game, a } = table();
    spawn(game, "Poetic Ingenuity");
    const dinos = [spawn(game, "Regisaur Alpha"), spawn(game, "Regisaur Alpha")];
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [...dinos, bears]);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(2);
  });

  it("makes a 3/1 Dinosaur for the first artifact spell each turn only", () => {
    const { game } = table();
    spawn(game, "Poetic Ingenuity");
    cast(game, toHand(game, "Ornithopter"));
    cast(game, toHand(game, "Ornithopter"));
    expect(tokensNamed(game, "3/1 Dinosaur Token", A)).toBe(1);
  });
});

describe("Ruin-Lurker Bat", () => {
  it("scries 1 at your end step only if you descended this turn", () => {
    const { game, a } = table();
    spawn(game, "Ruin-Lurker Bat");
    let scries = 0;
    a.chooseScryFn = () => {
      scries += 1;
      return [];
    };
    toStep(game, "end");
    settle(game);
    expect(scries).toBe(0);
    toStep(game, "precombat-main");
    descend(game);
    toStep(game, "end");
    settle(game);
    expect(scries).toBe(1);
  });
});

describe("Mephitic Draught", () => {
  it("draws and loses 1 life as it enters and as it goes to the graveyard, not when it's exiled", () => {
    const { game } = table();
    const before = hand(game).length;
    const draught = enter(game, "Mephitic Draught");
    expect(hand(game).length).toBe(before + 1);
    expect(life(game)).toBe(19);
    destroy(game, draught);
    settle(game);
    expect(hand(game).length).toBe(before + 2);
    expect(life(game)).toBe(18);
    const other = spawn(game, "Mephitic Draught");
    game.debugApplyEffect(B, { kind: "exile", target: 0 }, [ref(other)]);
    settle(game);
    expect(life(game)).toBe(18);
  });
});

describe("Vito, Fanatic of Aclazotz", () => {
  it("gains 2, then drains 2, then makes a Vampire Demon, then nothing", () => {
    const { game } = table();
    spawn(game, "Vito, Fanatic of Aclazotz");
    const fodder = [0, 1, 2, 3].map(() => spawn(game, "Ornithopter"));
    for (const id of fodder) {
      game.debugApplyEffect(A, { kind: "sacrifice-target", target: 0 }, [ref(id)]);
      settle(game);
    }
    expect(life(game)).toBe(22);
    expect(life(game, B)).toBe(18);
    expect(tokensOf(game, "Vampire Demon Token")).toHaveLength(1);
  });

  it("triggers for another permanent sacrificed at the same time as it (the ruling)", () => {
    const { game, a } = table();
    const vito = spawn(game, "Vito, Fanatic of Aclazotz");
    const thopter = spawn(game, "Ornithopter");
    const whisper = spawn(game, "Whisper, Blood Liturgist");
    const bears = toGraveyard(game, "Grizzly Bears");
    a.chooseSacrificesFn = () => [vito, thopter];
    a.choosePermanentsFn = () => [vito, thopter];
    game.dispatch({ type: "activate-ability", player: A, source: whisper, abilityIndex: 0, targets: [ref(bears)] });
    settle(game);
    expect(zone(game, vito)).toBe("graveyard");
    expect(zone(game, thopter)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game)).toBe(22);
  });
});

describe("Another Chance", () => {
  it("may mill two, then returns up to two creature cards, milled or not", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const old = toGraveyard(game, "Hill Giant");
    const milled = toLibrary(game, "Grizzly Bears");
    toLibrary(game, "Wastes");
    pickModes(a, 0);
    pickFromZone(a, old, milled);
    cast(game, toHand(game, "Another Chance"));
    expect(zone(game, old)).toBe("hand");
    expect(zone(game, milled)).toBe("hand");
  });
});

describe("Dusk Rose Reliquary", () => {
  it("costs a sacrifice, and exiles an opponent's artifact or creature until it leaves", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    const reliquary = toHand(game, "Dusk Rose Reliquary");
    cast(game, reliquary, { sacrifice: bears });
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("exile");
    destroy(game, reliquary);
    settle(game);
    expect(named(game, "Hill Giant", B).some((id) => zone(game, id) === "battlefield")).toBe(true);
  });
});

describe("Molten Collapse", () => {
  it("chooses one, or both if you descended this turn", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 2);
    const giant = spawn(game, "Hill Giant", B);
    const ring = spawn(game, "Sol Ring", B);
    const first = toHand(game, "Molten Collapse");
    expect(() => cast(game, first, { modes: [0, 1], targets: [ref(giant), ref(ring)] })).toThrow();
    descend(game);
    cast(game, first, { modes: [0, 1], targets: [ref(giant), ref(ring)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, ring)).toBe("graveyard");
  });
});

describe("Souls of the Lost", () => {
  it("costs a discard or a sacrifice, and counts permanent cards in your graveyard — itself too", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    toGraveyard(game, "Hill Giant");
    toGraveyard(game, "Lightning Bolt");
    const bears = spawn(game, "Grizzly Bears");
    const souls = toHand(game, "Souls of the Lost");
    const offer = game
      .legalActions(A)
      .find((x) => x.kind === "cast-spell" && x.card === souls && x.costOptionText === "Sacrifice a permanent");
    expect(offer?.kind).toBe("cast-spell");
    cast(game, souls, { costOption: offer?.kind === "cast-spell" ? offer.costOption : undefined, sacrifice: bears });
    expect(zone(game, bears)).toBe("graveyard");
    // Hill Giant and Grizzly Bears; not the Bolt.
    expect(pt(game, souls)).toEqual({ power: 2, toughness: 3 });
    destroy(game, souls);
    settle(game);
    expect(pt(game, souls)).toEqual({ power: 3, toughness: 4 });
  });
});
