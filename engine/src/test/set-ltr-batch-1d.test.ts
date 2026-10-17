/**
 * The Lord of the Rings: Tales of Middle-earth (LTR/LTC), group d — each test
 * the clause most likely to be wrong, written from the Oracle text. Written on
 * the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import { poolCounts } from "../mana.js";
import type { ObjectId } from "../primitives.js";
import type { TargetRef } from "../target.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
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
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

describe("Denethor, Ruling Steward", () => {
  it("makes a Human Soldier at your end step only if a creature died under your control this turn", () => {
    const { game } = table();
    spawn(game, "Denethor, Ruling Steward");
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Human Soldier Token", A)).toBe(0);

    const { game: g2 } = table();
    spawn(g2, "Denethor, Ruling Steward");
    const bears = spawn(g2, "Grizzly Bears");
    destroy(g2, bears);
    toStep(g2, "end");
    settle(g2);
    expect(tokensNamed(g2, "Human Soldier Token", A)).toBe(1);
  });

  it("can't sacrifice itself to drain", () => {
    const { game } = table();
    const denethor = spawn(game, "Denethor, Ruling Steward");
    lands(game, "Wastes", 2);
    expect(() => sacActivate(game, denethor, denethor)).toThrow();
    const bears = spawn(game, "Grizzly Bears");
    sacActivate(game, denethor, bears);
    expect(zone(game, bears)).toBe("graveyard");
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(21);
  });
});

describe("Bilbo, Retired Burglar", () => {
  it("the Ring tempts you when it enters and again when it leaves", () => {
    const { game } = table();
    const bilbo = enter(game, "Bilbo, Retired Burglar");
    expect(game.state.players[A].ringTemptations).toBe(1);
    destroy(game, bilbo);
    expect(game.state.players[A].ringTemptations).toBe(2);
  });
});

describe("Rally at the Hornburg", () => {
  it("gives Humans you control haste — the new tokens too — but not a non-Human", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const bears = spawn(game, "Grizzly Bears", A, { sick: true });
    cast(game, toHand(game, "Rally at the Hornburg"));
    const soldiers = named(game, "Human Soldier Token", A);
    expect(soldiers.length).toBeGreaterThan(0);
    expect(tokensNamed(game, "Human Soldier Token", A)).toBe(2);
    for (const s of soldiers) expect(keywords(game, s).has("haste")).toBe(true);
    expect(keywords(game, bears).has("haste")).toBe(false);
  });
});

describe("Bill the Pony", () => {
  it("sacrificing a Food makes the target assign combat damage equal to its toughness", () => {
    const { game, a } = table();
    const bill = spawn(game, "Bill the Pony");
    const food = spawn(game, "Food Token");
    sacActivate(game, bill, food, [ref(bill)]);
    expect(zone(game, food)).not.toBe("battlefield");
    expect(pt(game, bill).power).toBe(1);
    attack(game, a, [bill]);
    expect(life(game, B)).toBe(16);
  });
});

describe("Hobbit's Sting", () => {
  it("counts creatures you control plus Foods you control", () => {
    const { game } = table();
    lands(game, "Plains", 2);
    spawn(game, "Grizzly Bears");
    spawn(game, "Food Token");
    spawn(game, "Food Token");
    spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    spawn(game, "Serra Angel", B);
    const angel = named(game, "Serra Angel", B)[0];
    // 1 creature + 2 Foods = 3: kills the 3/3 Hill Giant, not the 4/4 Angel.
    cast(game, toHand(game, "Hobbit's Sting"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, angel)).toBe("battlefield");
  });
});

describe("Legolas, Counter of Kills", () => {
  it("untaps when you scry while it's tapped, but only once each turn", () => {
    const { game, a } = table();
    const legolas = spawn(game, "Legolas, Counter of Kills", A, { tapped: true });
    lands(game, "Island", 2);
    pickModes(a, 0);
    cast(game, toHand(game, "Opt"));
    expect(game.state.objects[legolas].tapped).toBe(false);
    game.state.objects[legolas].tapped = true;
    cast(game, toHand(game, "Opt"));
    expect(game.state.objects[legolas].tapped).toBe(true);
  });

  it("grows when a creature an opponent controls dies", () => {
    const { game } = table();
    const legolas = spawn(game, "Legolas, Counter of Kills");
    destroy(game, spawn(game, "Grizzly Bears", B));
    destroy(game, spawn(game, "Grizzly Bears", A));
    expect(counters(game, legolas)).toBe(1);
  });
});

describe("Galadriel, Gift-Giver", () => {
  it("entering, puts a +1/+1 counter on another target creature", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    pickModes(a, 0);
    pickTargets(a, bears);
    const galadriel = enter(game, "Galadriel, Gift-Giver");
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, galadriel)).toBe(0);
  });

  it("attacking, can make a Treasure instead", () => {
    const { game, a } = table();
    const galadriel = spawn(game, "Galadriel, Gift-Giver");
    spawn(game, "Grizzly Bears");
    pickModes(a, 2);
    attack(game, a, [galadriel]);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
  });
});

describe("Wizard's Rockets", () => {
  type Activate = Extract<LegalAction, { kind: "activate-ability" }>;

  it("enters tapped; {X}, {T}, sacrifice adds X mana in any combination of colours, then draws", () => {
    const { game } = table();
    const rockets = enter(game, "Wizard's Rockets");
    expect(game.state.objects[rockets].tapped).toBe(true);
    game.state.objects[rockets].tapped = false;
    lands(game, "Wastes", 2);
    const offer = game
      .legalActions(A)
      .find((o): o is Activate => o.kind === "activate-ability" && o.source === rockets);
    expect(offer?.xCost?.maxX).toBe(2);
    const before = hand(game).length;
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: rockets,
      abilityIndex: 0,
      targets: [],
      xValue: 2,
      manaColors: ["R", "G"],
    });
    expect(poolCounts(game.state.players[A].manaPool)).toMatchObject({ R: 1, G: 1 });
    settle(game);
    expect(zone(game, rockets)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Bitter Downfall", () => {
  it("costs {3} less targeting a creature dealt damage this turn, and its controller loses 2 life", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Shock"), { targets: [ref(giant)] });
    lands(game, "Swamp", 1);
    expect(() => cast(game, toHand(game, "Bitter Downfall"), { targets: [ref(bears)] })).toThrow();
    cast(game, toHand(game, "Bitter Downfall"), { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
  });
});

describe("Dúnedain Rangers", () => {
  it("landfall tempts you only while you don't control a Ring-bearer", () => {
    const { game } = table();
    spawn(game, "Dúnedain Rangers");
    enter(game, "Forest");
    expect(game.state.players[A].ringTemptations).toBe(1);
    enter(game, "Forest");
    expect(game.state.players[A].ringTemptations).toBe(1);
  });
});

describe("Grond, the Gatebreaker", () => {
  it("is an artifact creature on your turn while you control an Army, and not otherwise", () => {
    const { game } = table();
    const grond = spawn(game, "Grond, the Gatebreaker");
    expect(types(game, grond)).not.toContain("creature");
    spawn(game, "Army Token");
    expect(types(game, grond)).toEqual(expect.arrayContaining(["artifact", "creature"]));
    toStep(game, "upkeep", B);
    expect(types(game, grond)).not.toContain("creature");
  });
});

describe("Errand-Rider of Gondor", () => {
  it("draws, then puts a card from hand on the bottom unless you control a legendary creature", () => {
    const { game, a } = table();
    const card = toHand(game, "Grizzly Bears");
    pickFromZone(a, card);
    const before = hand(game).length;
    enter(game, "Errand-Rider of Gondor");
    expect(hand(game).length).toBe(before);
    expect(zone(game, card)).toBe("library");
    const library = game.state.zones.perPlayer[A].library;
    expect(library[library.length - 1]).toBe(card);

    const { game: g2 } = table();
    spawn(g2, "Legolas, Counter of Kills");
    const before2 = hand(g2).length;
    enter(g2, "Errand-Rider of Gondor");
    expect(hand(g2).length).toBe(before2 + 1);
  });
});

describe("Ent-Draught Basin", () => {
  it("targets only a creature whose power is the X paid", () => {
    const { game } = table();
    const basin = spawn(game, "Ent-Draught Basin");
    lands(game, "Wastes", 2);
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    expect(() => activate(game, basin, 0, { x: 2, targets: [ref(giant)] })).toThrow();
    activate(game, basin, 0, { x: 2, targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(1);
  });
});

describe("Nimble Hobbit", () => {
  it("attacking, sacrificing a Food taps target creature an opponent controls", () => {
    const { game, a } = table();
    const hobbit = spawn(game, "Nimble Hobbit");
    const food = spawn(game, "Food Token");
    const giant = spawn(game, "Hill Giant", B);
    pickModes(a, 0);
    pickTargets(a, giant);
    attack(game, a, [hobbit]);
    expect(zone(game, food)).not.toBe("battlefield");
    expect(game.state.objects[giant].tapped).toBe(true);
  });

  it("declining both, nothing is tapped", () => {
    const { game, a } = table();
    const hobbit = spawn(game, "Nimble Hobbit");
    const food = spawn(game, "Food Token");
    lands(game, "Plains", 3);
    const giant = spawn(game, "Hill Giant", B);
    pickModes(a);
    pickTargets(a, giant);
    attack(game, a, [hobbit]);
    expect(zone(game, food)).toBe("battlefield");
    expect(game.state.objects[giant].tapped).toBe(false);
  });
});

describe("Snarling Warg", () => {
  it("gets +1/+0 while you control a Goblin or Orc", () => {
    const { game } = table();
    const warg = spawn(game, "Snarling Warg");
    expect(pt(game, warg)).toEqual({ power: 3, toughness: 4 });
    spawn(game, "Cirith Ungol Patrol");
    expect(pt(game, warg)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Rohirrim Chargers", () => {
  it("exerted, puts the first Equipment revealed onto the battlefield attached to it", () => {
    const { game, a } = table();
    const chargers = spawn(game, "Rohirrim Chargers");
    const bonesplitter = toLibrary(game, "Bonesplitter");
    toLibrary(game, "Grizzly Bears");
    pickModes(a, 0);
    attack(game, a, [chargers]);
    expect(zone(game, bonesplitter)).toBe("battlefield");
    expect(game.state.objects[bonesplitter].attachedTo).toBe(chargers);
    // 4 + Bonesplitter's +2.
    expect(life(game, B)).toBe(14);
  });
});

/** Activate `source`'s first ability, sacrificing `sacrifice` for its cost
 * (the harness's `activate` leaves the sacrifice to the engine), then settle. */
function sacActivate(game: Game, source: ObjectId, sacrifice: ObjectId, targets: readonly TargetRef[] = []): void {
  const action = { type: "activate-ability", player: A, source, abilityIndex: 0, targets, sacrifice } as const;
  const why = game.canDispatch(action);
  if (why !== null) throw new Error(why);
  game.dispatch(action);
  settle(game);
}
