/**
 * The set walk, batch 61, part b (2026-10-12): Secrets of Strixhaven.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
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
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  quiet,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

const INKLING = "Inkling Token (Emeritus of Truce)";

/** A land enters (announced, so landfall fires), its triggers resolving in
 * this main phase. */
const landfall = (game: Game, name: string): void => {
  enter(game, name, A, { settle: false });
  game.advanceUntil((s) => quiet(s) && s.turn.step === "precombat-main");
};

/** The prepare spell copies in exile. */
const prepareCopies = (game: Game): ObjectId[] =>
  game.state.zones.shared.exile.filter((id) => game.state.objects[id].preparedFor !== undefined);

describe("Tam, Observant Sequencer", () => {
  it("landfall prepares it; the Deep Sight copy draws a card and gains 1 life", () => {
    const { game } = table();
    const tam = spawn(game, "Tam, Observant Sequencer");
    expect(game.state.objects[tam].prepared).toBeUndefined();
    landfall(game, "Forest");
    expect(game.state.objects[tam].prepared).toBeDefined();
    const [copy] = prepareCopies(game);
    expect(game.state.objects[copy].cardName).toBe("Deep Sight");
    // A second land while prepared doesn't make a second copy (the ruling).
    landfall(game, "Island");
    expect(prepareCopies(game)).toHaveLength(1);
    const before = hand(game).length;
    cast(game, copy, { via: "prepared" });
    expect(game.state.objects[tam].prepared).toBeUndefined();
    expect(hand(game).length).toBe(before + 1);
    expect(life(game, A)).toBe(21);
  });
});

describe("Comforting Counsel", () => {
  it("a growth counter per life gain; creatures you control get +3/+3 only from the fifth", () => {
    const { game } = table();
    const counsel = spawn(game, "Comforting Counsel");
    const bears = spawn(game, "Grizzly Bears");
    const gain = (): void => {
      game.debugApplyEffect(A, { kind: "gain-life", amount: 1 }, []);
      settle(game);
    };
    for (let i = 0; i < 4; i++) gain();
    expect(counters(game, counsel, "growth")).toBe(4);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    gain();
    expect(counters(game, counsel, "growth")).toBe(5);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
    // An opponent's creature isn't yours.
    expect(pt(game, spawn(game, "Grizzly Bears", B))).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Potioner's Trove", () => {
  it("gains 2 life only once you've cast an instant or sorcery spell this turn", () => {
    const { game } = table();
    const trove = spawn(game, "Potioner's Trove");
    const gainAbility = () =>
      game.legalActions(A).filter((a) => a.kind === "activate-ability" && a.source === trove && a.abilityIndex === 1);
    expect(gainAbility()).toHaveLength(0);
    spawn(game, "Mountain");
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(gainAbility()).toHaveLength(1);
    game.dispatch({ type: "activate-ability", player: A, source: trove, abilityIndex: 1, targets: [] });
    settle(game);
    expect(life(game, A)).toBe(22);
  });
});

describe("Primary Research", () => {
  it("returns a nonland permanent card with mana value 3 or less, and the end step draws since a card left", () => {
    const { game, a } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    const elves = toGraveyard(game, "Llanowar Elves");
    const giant = toGraveyard(game, "Hill Giant");
    const forest = toGraveyard(game, "Forest");
    const bolt = toGraveyard(game, "Lightning Bolt");
    const seen = watchTargets(a, () => [bears]);
    enter(game, "Primary Research");
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toEqual(expect.arrayContaining([bears, elves]));
    expect(seen.offered[0]).not.toContain(giant);
    expect(seen.offered[0]).not.toContain(forest);
    expect(seen.offered[0]).not.toContain(bolt);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, elves)).toBe("graveyard");
    const before = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(hand(game).length).toBe(before + 1);
  });

  it("doesn't draw on a turn no card left your graveyard", () => {
    const { game } = table();
    spawn(game, "Primary Research");
    toGraveyard(game, "Grizzly Bears");
    const before = hand(game).length;
    toStep(game, "end");
    settle(game);
    expect(hand(game).length).toBe(before);
  });
});

describe("Hardened Academic and Divergent Equation", () => {
  it("two cards returned together trigger the Academic once; the Equation exiles itself", () => {
    const { game, a } = table();
    const academic = spawn(game, "Hardened Academic");
    const bolts = [toGraveyard(game, "Lightning Bolt"), toGraveyard(game, "Lightning Bolt")];
    toGraveyard(game, "Grizzly Bears");
    lands(game, "Island", 5);
    pickTargets(a, academic);
    const equation = toHand(game, "Divergent Equation");
    cast(game, equation, { x: 2, targets: bolts.map(ref) });
    expect(bolts.map((id) => zone(game, id))).toEqual(["hand", "hand"]);
    expect(zone(game, equation)).toBe("exile");
    expect(counters(game, academic)).toBe(1);
  });

  it("can't return more than X, nor a creature card", () => {
    const { game } = table();
    const bolts = [toGraveyard(game, "Lightning Bolt"), toGraveyard(game, "Lightning Bolt")];
    const bears = toGraveyard(game, "Grizzly Bears");
    lands(game, "Island", 5);
    const equation = toHand(game, "Divergent Equation");
    expect(() => cast(game, equation, { x: 1, targets: bolts.map(ref) })).toThrow();
    expect(() => cast(game, equation, { x: 1, targets: [ref(bears)] })).toThrow();
  });
});

describe("Splatter Technique", () => {
  it("deals 4 damage to each creature and planeswalker", () => {
    const { game } = table();
    lands(game, "Island", 3);
    lands(game, "Mountain", 2);
    const giant = spawn(game, "Hill Giant", B);
    const mine = spawn(game, "Grizzly Bears");
    const jace = spawn(game, "Jace Beleren", B);
    game.state.objects[jace].counters.loyalty = 5;
    cast(game, toHand(game, "Splatter Technique"), { modes: [1] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, mine)).toBe("graveyard");
    expect(counters(game, jace, "loyalty")).toBe(1);
  });
});

describe("Informed Inkwright and Graduation Day (repartee)", () => {
  it("trigger on an instant that targets a creature, not one that targets a player", () => {
    const { game, a } = table();
    spawn(game, "Informed Inkwright");
    spawn(game, "Graduation Day");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    lands(game, "Mountain", 1);
    pickTargets(a, bears);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(tokensNamed(game, INKLING)).toBe(0);
    expect(counters(game, bears)).toBe(0);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bears)] });
    expect(tokensNamed(game, INKLING)).toBe(1);
    expect(counters(game, bears)).toBe(1);
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
  });
});

describe("Wildgrowth Archaic", () => {
  it("a creature spell you cast enters with a counter per colour spent on it", () => {
    const { game } = table();
    const archaic = spawn(game, "Wildgrowth Archaic");
    game.state.objects[archaic].counters["+1/+1"] = 2;
    spawn(game, "Forest");
    spawn(game, "Island");
    cast(game, toHand(game, "Grizzly Bears"));
    const [bears] = named(game, "Grizzly Bears");
    expect(counters(game, bears)).toBe(2);
    expect(keywords(game, archaic).has("trample")).toBe(true);
  });
});

describe("Aziza, Mage Tower Captain", () => {
  it("tapping three untapped creatures copies the spell", () => {
    const { game, a } = table();
    const aziza = spawn(game, "Aziza, Mage Tower Captain");
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    const spare = spawn(game, "Hill Giant");
    spawn(game, "Mountain");
    pickModes(a, 0);
    const seen = pickPermanents(a, aziza, ...bears);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(seen.offered).toEqual(expect.arrayContaining([aziza, ...bears, spare]));
    expect(life(game, B)).toBe(14);
    expect([aziza, ...bears].every((id) => game.state.objects[id].tapped)).toBe(true);
    expect(game.state.objects[spare].tapped).toBe(false);
  });

  it("isn't offered with fewer than three untapped creatures", () => {
    const { game, a } = table();
    spawn(game, "Aziza, Mage Tower Captain");
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Hill Giant", A, { tapped: true });
    spawn(game, "Mountain");
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    expect(asked).toBe(0);
    expect(life(game, B)).toBe(17);
    expect(game.state.objects[bears].tapped).toBe(false);
  });
});

describe("Rabid Attack", () => {
  it("each target gets +1/+0 and draws its controller a card as it dies this turn", () => {
    const { game } = table();
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    const other = spawn(game, "Hill Giant");
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Rabid Attack"), { targets: bears.map(ref) });
    expect(bears.map((id) => pt(game, id))).toEqual([
      { power: 3, toughness: 2 },
      { power: 3, toughness: 2 },
    ]);
    expect(pt(game, other)).toEqual({ power: 3, toughness: 3 });
    const before = hand(game).length;
    destroy(game, bears[0]);
    settle(game);
    expect(hand(game).length).toBe(before + 1);
    destroy(game, other);
    settle(game);
    expect(hand(game).length).toBe(before + 1);
    expect(graveyard(game)).toContain(bears[0]);
  });
});

describe("Root Manipulation", () => {
  it("creatures you control get +2/+2, menace and an attack trigger that gains 1 life", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 2);
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Root Manipulation"));
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, bears).has("menace")).toBe(true);
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    attack(game, a, [bears]);
    expect(life(game, A)).toBe(21);
    expect(life(game, B)).toBe(16);
  });
});

describe("Cost of Brilliance", () => {
  it("target player draws two and loses 2 life; up to one creature gets a counter", () => {
    const { game } = table();
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 3);
    const before = hand(game, B).length;
    cast(game, toHand(game, "Cost of Brilliance"), { targets: [ref(B), ref(theirs)] });
    expect(hand(game, B).length).toBe(before + 2);
    expect(life(game, B)).toBe(18);
    expect(counters(game, theirs)).toBe(1);
  });
});
