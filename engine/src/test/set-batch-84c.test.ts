/**
 * Set walk batch 84, part c (2026-10-15): Aetherdrift (DFT), Aetherdrift Commander (DRC) and Foundations (FDN), the rest of the sets.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  types,
  watchTargets,
  zone,
} from "./harness.js";

/** `id` becomes an artifact creature until end of turn — a crewed Vehicle. */
const crewed = (game: Game, id: ObjectId): void =>
  game.debugApplyEffect(A, { kind: "add-types", target: 0, addTypes: ["artifact", "creature"], duration: "end-of-turn" }, [
    ref(id),
  ]);

const isTapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;

describe("Crash and Burn", () => {
  it("destroys target Vehicle, a creature or not", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const ride = spawn(game, "Haunted Hellride", B);
    cast(game, toHand(game, "Crash and Burn"), { modes: [0], targets: [ref(ride)] });
    expect(zone(game, ride)).toBe("graveyard");
  });

  it("deals 6 damage to target creature or planeswalker; the Vehicle mode can't take a non-Vehicle", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const wurm = spawn(game, "Craw Wurm", B);
    const card = toHand(game, "Crash and Burn");
    expect(() => cast(game, card, { modes: [0], targets: [ref(wurm)] })).toThrow();
    cast(game, card, { modes: [1], targets: [ref(wurm)] });
    expect(zone(game, wurm)).toBe("graveyard");
  });
});

describe("Haunted Hellride", () => {
  it("whenever you attack, your creature gets +1/+0 and deathtouch, and untaps", () => {
    const { game, a } = table();
    spawn(game, "Haunted Hellride");
    const bears = spawn(game, "Grizzly Bears");
    // The uncrewed Vehicle isn't a creature: the attacker is the one target.
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(17);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bears).has("deathtouch")).toBe(true);
    expect(isTapped(game, bears)).toBe(false);
  });

  it("may pick a creature you control that isn't attacking", () => {
    const { game, a } = table();
    spawn(game, "Haunted Hellride");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", A, { tapped: true });
    const seen = watchTargets(a, () => [giant]);
    attack(game, a, [bears]);
    expect([...seen.offered[0]].sort()).toEqual([bears, giant].sort());
    expect(isTapped(game, giant)).toBe(false);
    expect(keywords(game, giant).has("deathtouch")).toBe(true);
    expect(keywords(game, bears).has("deathtouch")).toBe(false);
  });
});

describe("Apocalypse Runner", () => {
  it("{T}: a creature you control with power 2 or less gains lifelink and can't be blocked, for the turn", () => {
    const { game } = table();
    const runner = spawn(game, "Apocalypse Runner");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    expect(() => activate(game, runner, 0, { targets: [ref(giant)] })).toThrow();
    activate(game, runner, 0, { targets: [ref(bears)] });
    expect(isTapped(game, runner)).toBe(true);
    // Growing past 2 power afterwards changes nothing (the ruling).
    game.debugApplyEffect(A, { kind: "modify-pt", target: 0, power: 3, toughness: 0, duration: "end-of-turn" }, [ref(bears)]);
    expect(keywords(game, bears).has("lifelink")).toBe(true);
    expect(keywords(game, bears).has("unblockable")).toBe(true);
  });

  it("the creature it picks deals unblockable damage and gains its controller that much life", () => {
    const { game, a } = table();
    const runner = spawn(game, "Apocalypse Runner");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, runner, 0, { targets: [ref(bears)] });
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(22);
  });
});

describe("Fang Guardian", () => {
  it("gives another creature or Vehicle you control +2/+2 — never itself or an opponent's", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const ride = spawn(game, "Haunted Hellride");
    spawn(game, "Hill Giant", B);
    const seen = watchTargets(a, () => [ride]);
    const guardian = enter(game, "Fang Guardian");
    expect([...seen.offered[0]].sort()).toEqual([bears, ride].sort());
    expect(seen.offered[0]).not.toContain(guardian);
    expect(pt(game, ride)).toEqual({ power: 5, toughness: 5 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Scrap Compactor", () => {
  it("{3}, {T}, sacrifice: 3 damage to target creature", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const compactor = spawn(game, "Scrap Compactor");
    const giant = spawn(game, "Hill Giant", B);
    activate(game, compactor, 0, { targets: [ref(giant)] });
    expect(zone(game, compactor)).toBe("graveyard");
    expect(zone(game, giant)).toBe("graveyard");
  });

  it("{6}, {T}, sacrifice: destroy target creature or Vehicle", () => {
    const { game } = table();
    lands(game, "Wastes", 6);
    const compactor = spawn(game, "Scrap Compactor");
    const ride = spawn(game, "Haunted Hellride", B);
    activate(game, compactor, 1, { targets: [ref(ride)] });
    expect(zone(game, compactor)).toBe("graveyard");
    expect(zone(game, ride)).toBe("graveyard");
  });
});

describe("Howler's Heavy", () => {
  it("cycled, draws a card and gives an opponent's creature -3/-0", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears");
    const heavy = toHand(game, "Howler's Heavy");
    const before = hand(game).length;
    const seen = watchTargets(a, (offered) => offered.map(() => giant));
    game.dispatch({ type: "cycle", player: A, card: heavy });
    settle(game);
    expect(zone(game, heavy)).toBe("graveyard");
    expect(hand(game).length).toBe(before);
    expect(seen.offered[0] ?? [giant]).not.toContain(bears);
    expect(pt(game, giant)).toEqual({ power: 0, toughness: 3 });
  });
});

describe("Gastal Blockbuster", () => {
  it("you may sacrifice a creature; when you do, destroy target artifact an opponent controls", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const ring = spawn(game, "Sol Ring", B);
    const mine = spawn(game, "Sol Ring");
    const bears = spawn(game, "Grizzly Bears");
    const blockbuster = toHand(game, "Gastal Blockbuster");
    let offered: readonly ObjectId[] = [];
    a.chooseSacrificesFn = (_view, eligible) => {
      offered = eligible;
      return [bears];
    };
    pickModes(a, 0);
    cast(game, blockbuster);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, ring)).toBe("graveyard");
    expect(zone(game, mine)).toBe("battlefield");
    // Not "another": it may sacrifice itself.
    expect([...offered].sort()).toEqual([bears, blockbuster].sort());
  });

  it("a Vehicle that isn't a creature may be the one sacrificed", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const ring = spawn(game, "Sol Ring", B);
    const ride = spawn(game, "Haunted Hellride");
    a.chooseSacrificesFn = () => [ride];
    pickModes(a, 0);
    cast(game, toHand(game, "Gastal Blockbuster"));
    expect(zone(game, ride)).toBe("graveyard");
    expect(zone(game, ring)).toBe("graveyard");
  });

  it("declining sacrifices nothing and destroys nothing", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const ring = spawn(game, "Sol Ring", B);
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a);
    cast(game, toHand(game, "Gastal Blockbuster"));
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, ring)).toBe("battlefield");
  });
});

describe("Roadside Blowout", () => {
  it("costs {2} less targeting a permanent with mana value 1, and bounces it and draws", () => {
    const { game } = table();
    lands(game, "Island", 1);
    const elves = spawn(game, "Llanowar Elves", B);
    const giant = spawn(game, "Hill Giant", B);
    const blowout = toHand(game, "Roadside Blowout");
    expect(() => cast(game, blowout, { targets: [ref(giant)] })).toThrow();
    const before = hand(game).length;
    cast(game, blowout, { targets: [ref(elves)] });
    expect(zone(game, elves)).toBe("hand");
    // The spell left the hand, a card came in.
    expect(hand(game).length).toBe(before);
  });

  it("at full cost it bounces any creature or Vehicle an opponent controls", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const ride = spawn(game, "Haunted Hellride", B);
    cast(game, toHand(game, "Roadside Blowout"), { targets: [ref(ride)] });
    expect(zone(game, ride)).toBe("hand");
  });
});

describe("Thundering Broodwagon", () => {
  it("destroys a nonland permanent an opponent controls with mana value 4 or less", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant", B);
    spawn(game, "Craw Wurm", B);
    spawn(game, "Forest", B);
    spawn(game, "Grizzly Bears");
    const seen = watchTargets(a, (offered) => offered.map(() => giant));
    const wagon = enter(game, "Thundering Broodwagon");
    expect(seen.offered[0] ?? [giant]).toEqual([giant]);
    expect(zone(game, giant)).toBe("graveyard");
    expect(keywords(game, wagon).has("menace")).toBe(true);
    expect(keywords(game, wagon).has("reach")).toBe(true);
  });
});

describe("Daring Mechanic", () => {
  it("puts a +1/+1 counter on any Mount or Vehicle, never another creature", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const mechanic = spawn(game, "Daring Mechanic");
    const jaguar = spawn(game, "Alacrian Jaguar");
    const ride = spawn(game, "Haunted Hellride", B);
    spawn(game, "Grizzly Bears");
    const offer = game
      .legalActions(A)
      .find((action) => action.kind === "activate-ability" && action.source === mechanic);
    const options = offer?.kind === "activate-ability" ? (offer.targetOptions[0] ?? []) : [];
    expect(options.map((t) => (t.kind === "object" ? t.object : null)).sort()).toEqual([jaguar, ride].sort());
    activate(game, mechanic, 0, { targets: [ref(ride)] });
    expect(counters(game, ride)).toBe(1);
  });
});

describe("Marshals' Pathcruiser", () => {
  it("entering, finds a basic land card", () => {
    const { game, a } = table();
    const forest = toLibrary(game, "Forest");
    pickFromZone(a, forest);
    enter(game, "Marshals' Pathcruiser");
    expect(zone(game, forest)).toBe("hand");
  });

  it("exhaust: an artifact creature for good with two +1/+1 counters, once", () => {
    const { game } = table();
    for (const land of ["Plains", "Island", "Swamp", "Mountain", "Forest"]) lands(game, land, 2);
    const cruiser = spawn(game, "Marshals' Pathcruiser");
    activate(game, cruiser, 0);
    expect(types(game, cruiser)).toContain("creature");
    expect(pt(game, cruiser)).toEqual({ power: 8, toughness: 7 });
    expect(() => activate(game, cruiser, 0)).toThrow();
    nextTurn(game);
    nextTurn(game);
    expect(types(game, cruiser)).toContain("creature");
  });

  it("crewed, it's a creature only until end of turn", () => {
    const { game } = table();
    const cruiser = spawn(game, "Marshals' Pathcruiser");
    crewed(game, cruiser);
    expect(types(game, cruiser)).toContain("creature");
    nextTurn(game);
    expect(types(game, cruiser)).not.toContain("creature");
  });
});

describe("Pacesetter Paragon", () => {
  it("exhaust: a +1/+1 counter and double strike until end of turn", () => {
    const { game, a } = table();
    lands(game, "Mountain", 6);
    const paragon = spawn(game, "Pacesetter Paragon");
    activate(game, paragon, 0);
    expect(counters(game, paragon)).toBe(1);
    expect(keywords(game, paragon).has("double-strike")).toBe(true);
    expect(() => activate(game, paragon, 0)).toThrow();
    attack(game, a, [paragon]);
    expect(life(game, B)).toBe(14);
    nextTurn(game);
    expect(keywords(game, paragon).has("double-strike")).toBe(false);
    expect(counters(game, paragon)).toBe(1);
  });
});

describe("Grim Javelineer", () => {
  it("pumps an attacker; when it dies this turn, you surveil 1", () => {
    const { game, a, b } = table();
    spawn(game, "Grim Javelineer");
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant", B);
    const top = toLibrary(game, "Grizzly Bears");
    let surveilled: readonly ObjectId[] = [];
    a.chooseScryFn = (_view, cards) => {
      surveilled = cards;
      return [...cards];
    };
    pickTargets(a, bears);
    b.declareBlockersFn = () => [{ blocker: giant, attacker: bears }];
    attack(game, a, [bears]);
    expect(zone(game, bears)).toBe("graveyard");
    // 3 power from the pump: the 3/3 blocker dies too.
    expect(zone(game, giant)).toBe("graveyard");
    expect(surveilled).toEqual([top]);
    expect(zone(game, top)).toBe("graveyard");
  });

  it("no surveil when the creature survives the turn, or dies on a later one", () => {
    const { game, a } = table();
    spawn(game, "Grim Javelineer");
    const bears = spawn(game, "Grizzly Bears");
    let asked = 0;
    a.chooseScryFn = (_view, cards) => {
      asked += 1;
      return [...cards];
    };
    pickTargets(a, bears);
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(17);
    nextTurn(game);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(bears)]);
    settle(game);
    expect(zone(game, bears)).toBe("graveyard");
    expect(asked).toBe(0);
  });
});
