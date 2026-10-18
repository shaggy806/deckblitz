/**
 * The "owner puts it on their choice of the top or bottom of their library"
 * cards, group b (2026-10-17) — written from the Oracle text, on the shared
 * table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ScriptedController } from "../controller.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  cast,
  graveyard,
  lands,
  named,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

const libraryOf = (game: Game, player: PlayerId) => game.state.zones.perPlayer[player].library;
const bottomOf = (game: Game, player: PlayerId) => {
  const library = libraryOf(game, player);
  return library[library.length - 1];
};

/** Bob attacks alice with `attackers` on his turn; alice then has priority
 * in the declare attackers step. */
function bobAttacks(game: Game, b: ScriptedController, attackers: readonly ObjectId[]): void {
  b.declareAttackersFn = () => attackers.map((attacker) => ({ attacker, defender: A }));
  toStep(game, "declare-attackers", B);
  game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.priority.holder === A);
}

describe("Plan for All Outcomes", () => {
  it("the target's owner picks the bottom, and casting it doesn't empower Jace that turn", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 6);
    pickTargets(a, bears);
    b.chooseModesFn = () => [1];
    cast(game, toHand(game, "Plan for All Outcomes"));
    expect(bottomOf(game, B)).toBe(bears);
    // Plan itself was this turn's first noncreature spell, so a second one
    // doesn't trigger it (the ruling).
    cast(game, toHand(game, "Opt"));
    expect(named(game, "Jace Token", A)).toHaveLength(0);
  });

  it("empowers Jace 1 on the first noncreature spell, a creature spell before it not counting", () => {
    const { game } = table();
    spawn(game, "Plan for All Outcomes");
    lands(game, "Island", 3);
    cast(game, toHand(game, "Coral Merfolk"));
    expect(named(game, "Jace Token", A)).toHaveLength(0);
    cast(game, toHand(game, "Opt"));
    const [jace] = named(game, "Jace Token", A);
    expect(jace).toBeDefined();
    expect(game.state.objects[jace].counters.loyalty).toBe(1);
  });
});

describe("Uneasy Partings", () => {
  it("costs {1} less only against an attacking nontoken creature", () => {
    const { game, a } = table();
    const giant = spawn(game, "Hill Giant");
    const token = spawn(game, "Human Soldier Token");
    game.state.objects[token].isToken = true; // a spawn is a card, not a token
    lands(game, "Island", 3);
    const partings = toHand(game, "Uneasy Partings");
    a.declareAttackersFn = () => [
      { attacker: giant, defender: B },
      { attacker: token, defender: B },
    ];
    toStep(game, "declare-attackers");
    settle(game);
    expect(() => cast(game, partings, { targets: [ref(token)] })).toThrow();
    a.chooseModesFn = () => [1];
    cast(game, partings, { targets: [ref(giant)] });
    expect(bottomOf(game, A)).toBe(giant);
  });
});

describe("Dire Downdraft", () => {
  it("costs {1} less against a tapped creature that isn't attacking", () => {
    const { game, b } = table();
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    const untapped = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 3);
    const downdraft = toHand(game, "Dire Downdraft");
    expect(() => cast(game, downdraft, { targets: [ref(untapped)] })).toThrow();
    b.chooseModesFn = () => [0];
    cast(game, downdraft, { targets: [ref(bears)] });
    expect(libraryOf(game, B)[0]).toBe(bears);
  });
});

describe("Lost in Space", () => {
  it("surveils after the owner has placed it, so the surveil can see it", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring");
    lands(game, "Island", 4);
    a.chooseModesFn = () => [0]; // top
    let seen: readonly ObjectId[] = [];
    a.chooseScryFn = (_view, cards) => {
      seen = cards;
      return cards;
    };
    cast(game, toHand(game, "Lost in Space"), { targets: [ref(ring)] });
    expect(seen).toEqual([ring]);
    expect(zone(game, ring)).toBe("graveyard");
  });

  it("can't target a land", () => {
    const { game } = table();
    const land = spawn(game, "Forest", B);
    lands(game, "Island", 4);
    expect(() => cast(game, toHand(game, "Lost in Space"), { targets: [ref(land)] })).toThrow();
  });
});

describe("Uncharted Voyage", () => {
  it("a stolen creature's owner chooses, then its caster surveils 1", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    game.state.objects[bears].controller = A;
    b.chooseModesFn = () => [1];
    let surveilled = 0;
    a.chooseScryFn = (_view, cards) => {
      surveilled = cards.length;
      return [];
    };
    lands(game, "Island", 4);
    cast(game, toHand(game, "Uncharted Voyage"), { targets: [ref(bears)] });
    expect(bottomOf(game, B)).toBe(bears);
    expect(surveilled).toBe(1);
  });
});

describe("Riverwalk Technique", () => {
  it("first mode: the nonland permanent's owner picks", () => {
    const { game, b } = table();
    const ring = spawn(game, "Sol Ring", B);
    lands(game, "Island", 4);
    b.chooseModesFn = () => [1];
    cast(game, toHand(game, "Riverwalk Technique"), { modes: [0], targets: [ref(ring)] });
    expect(bottomOf(game, B)).toBe(ring);
  });

  it("second mode counters a noncreature spell", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const opt = toHand(game, "Opt");
    cast(game, opt, { settle: false });
    cast(game, toHand(game, "Riverwalk Technique"), { modes: [1], targets: [ref(opt)] });
    expect(graveyard(game)).toContain(opt);
  });
});

describe("Sudden Setback", () => {
  it("puts a spell on its owner's chosen end of the library, uncountered", () => {
    const { game, a } = table();
    lands(game, "Island", 6);
    const bears = toHand(game, "Coral Merfolk");
    cast(game, bears, { settle: false });
    a.chooseModesFn = () => [1];
    cast(game, toHand(game, "Sudden Setback"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("library");
    expect(bottomOf(game, A)).toBe(bears);
  });
});

describe("Horned Loch-Whale // Lagoon Breach", () => {
  it("enters tapped on an opponent's turn and untapped on its controller's", () => {
    const { game, b } = table();
    lands(game, "Island", 12);
    const mine = toHand(game, "Horned Loch-Whale");
    cast(game, mine);
    expect(game.state.objects[mine].tapped).toBe(false);
    const attacker = spawn(game, "Grizzly Bears", B);
    bobAttacks(game, b, [attacker]);
    const flashed = toHand(game, "Horned Loch-Whale");
    cast(game, flashed);
    expect(game.state.objects[flashed].tapped).toBe(true);
  });

  it("Lagoon Breach: the attacker's owner picks, and the whale goes on an adventure", () => {
    const { game, b } = table();
    lands(game, "Island", 2);
    const attacker = spawn(game, "Grizzly Bears", B);
    const whale = toHand(game, "Horned Loch-Whale");
    bobAttacks(game, b, [attacker]);
    b.chooseModesFn = () => [1];
    cast(game, whale, { face: 1, targets: [ref(attacker)] });
    expect(bottomOf(game, B)).toBe(attacker);
    expect(zone(game, whale)).toBe("exile");
  });

  it("Lagoon Breach can't target a creature you control", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    const giant = spawn(game, "Hill Giant");
    a.declareAttackersFn = () => [{ attacker: giant, defender: B }];
    toStep(game, "declare-attackers");
    settle(game);
    expect(() => cast(game, toHand(game, "Horned Loch-Whale"), { face: 1, targets: [ref(giant)] })).toThrow();
  });
});
