/**
 * The set walk, batch 54, part b (2026-10-11): The Hobbit's last cards and
 * Marvel Super Heroes Commander's first. Written on the shared table in
 * `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  supertypes,
  table,
  toHand,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

const castable = (game: ReturnType<typeof table>["game"], card: ObjectId): boolean =>
  game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === card);

describe("The Lord of the Eagles", () => {
  it("costs {X} less, X the total power of only the creatures you control with flying", () => {
    const { game } = table();
    const lord = toHand(game, "The Lord of the Eagles");
    lands(game, "Island", 3);
    // A 6-power ground creature counts for nothing; Wind Drake's 2 leaves {5}{U}{U}.
    spawn(game, "Colossal Dreadmaw");
    spawn(game, "Wind Drake");
    spawn(game, "Serra Angel", B); // an opponent's flier doesn't count either
    expect(castable(game, lord)).toBe(false);
    // Serra Angel's 4 more: {7} less 6 is {1}{U}{U}.
    spawn(game, "Serra Angel");
    expect(castable(game, lord)).toBe(true);
    cast(game, lord);
    expect(zone(game, lord)).toBe("battlefield");
  });
});

describe("Loki, the Deceiver", () => {
  it("copies another Villain tapped and attacking, not legendary and an Illusion, sacrificed at the next end step", () => {
    const { game, a } = table();
    const loki = spawn(game, "Loki, the Deceiver");
    const doom = spawn(game, "Doctor Doom, Unrivaled");
    pickTargets(a, doom);
    a.declareAttackersFn = () => [{ attacker: loki, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-attackers" && s.zones.shared.stack.length === 0 && s.awaiting === null);
    const [token] = named(game, "Doctor Doom, Unrivaled").filter((id) => id !== doom);
    expect(token).toBeDefined();
    expect(game.state.objects[token].isToken).toBe(true);
    expect(game.state.objects[token].tapped).toBe(true);
    expect(game.state.objects[token].attacking).toBe(B);
    expect(supertypes(game, token)).not.toContain("legendary");
    expect(subtypes(game, token)).toEqual(expect.arrayContaining(["Human", "Sorcerer", "Villain", "Illusion"]));
    // Not legendary, so the legend rule leaves the original alone.
    expect(zone(game, doom)).toBe("battlefield");

    // Two Villains deal combat damage at once: one draw.
    const before = hand(game).length;
    game.advanceUntil((s) => s.turn.step === "postcombat-main" && s.zones.shared.stack.length === 0);
    expect(life(game, B)).toBe(12);
    expect(hand(game).length).toBe(before + 1);

    game.advanceUntil((s) => s.turn.number === 2);
    expect(named(game, "Doctor Doom, Unrivaled")).toEqual([doom]);
    expect(zone(game, loki)).toBe("battlefield");
  });
});

describe("Bejeweled Warg", () => {
  it("puts a +1/+1 counter on target Wolf you control, or makes a Treasure", () => {
    const { game, a } = table();
    const warg = spawn(game, "Bejeweled Warg");
    const wolf = spawn(game, "Darkthicket Wolf");
    pickModes(a, 0);
    const seen = watchTargets(a, () => [wolf]);
    attack(game, a, [warg]);
    expect(seen.offered[0]).toEqual(expect.arrayContaining([warg, wolf]));
    expect(counters(game, wolf)).toBe(1);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(0);

    pickModes(a, 1);
    game.advanceUntil((s) => s.turn.number === 3 && s.turn.step === "precombat-main" && s.priority.holder === A);
    attack(game, a, [warg]);
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    expect(counters(game, wolf)).toBe(1);
  });
});

describe("Swordsman's Steel", () => {
  it("draws a card for each Equipment you control and gives +2/+2 for each", () => {
    const { game } = table();
    spawn(game, "Bonesplitter");
    lands(game, "Wastes", 7);
    const steel = toHand(game, "Swordsman's Steel");
    const before = hand(game).length;
    cast(game, steel);
    // It left the hand; two Equipment, itself included: two cards.
    expect(hand(game).length).toBe(before - 1 + 2);
    const bears = spawn(game, "Grizzly Bears");
    activate(game, steel, 0, { targets: [ref(bears)] });
    // Two Equipment: +4/+4.
    expect(pt(game, bears)).toEqual({ power: 6, toughness: 6 });
  });
});

describe("Bard the Bowman", () => {
  it("only the second card drawn each turn puts a counter on target creature and grants lifelink", () => {
    const { game, a } = table();
    spawn(game, "Bard the Bowman");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    // However many alice drew in her draw step, two more reach the second.
    game.debugApplyEffect(A, { kind: "draw", amount: 2 });
    settle(game);
    expect(counters(game, bears)).toBe(1);
    expect(keywords(game, bears).has("lifelink")).toBe(true);
    game.debugApplyEffect(A, { kind: "draw", amount: 2 });
    settle(game);
    expect(counters(game, bears)).toBe(1);
  });
});

describe("Doctor Doom, Unrivaled", () => {
  it("wins as the ability resolves when the draw empties the library, even at 0 life", () => {
    const { game } = table();
    const doom = spawn(game, "Doctor Doom, Unrivaled");
    game.state.zones.perPlayer[A].library = game.state.zones.perPlayer[A].library.slice(0, 1);
    game.state.players[A].life = 1;
    activate(game, doom, 0, { settle: false });
    game.advanceUntil((s) => s.result.over || s.zones.shared.stack.length === 0);
    expect(game.state.result).toMatchObject({ over: true, winner: A });
  });

  it("only draws and loses 1 life while cards are left", () => {
    const { game } = table();
    const doom = spawn(game, "Doctor Doom, Unrivaled");
    game.state.zones.perPlayer[A].library = game.state.zones.perPlayer[A].library.slice(0, 2);
    const before = hand(game).length;
    activate(game, doom);
    expect(game.state.result.over).toBe(false);
    expect(hand(game).length).toBe(before + 1);
    expect(life(game, A)).toBe(19);
  });
});

describe("Rage into the Valley", () => {
  it("draws, loses 1 life and amasses Goblins 2", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const rage = toHand(game, "Rage into the Valley");
    const before = hand(game).length;
    cast(game, rage);
    expect(hand(game).length).toBe(before); // the spell left, a card came
    expect(life(game, A)).toBe(19);
    const [army] = named(game, "Army Token", A);
    expect(counters(game, army)).toBe(2);
    expect(subtypes(game, army)).toContain("Goblin");
  });
});

describe("Goblin-town", () => {
  it("puts two +1/+1 counters on a Goblin or an Orc you control, nothing else", () => {
    const { game } = table();
    const town = spawn(game, "Goblin-town");
    expect(game.state.objects[town].tapped).toBe(true); // it enters tapped
    game.state.objects[town].tapped = false;
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    lands(game, "Wastes", 2);
    const orc = spawn(game, "Orcish Lumberjack");
    const goblin = spawn(game, "Raging Goblin");
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Raging Goblin", B);
    const offer = game
      .legalActions(A)
      .find((o) => o.kind === "activate-ability" && o.source === town && o.abilityIndex === 1);
    const options = offer?.kind === "activate-ability" ? offer.targetOptions[0] : [];
    expect(options.map((t) => (t.kind === "object" ? t.object : t.player)).sort()).toEqual([orc, goblin].sort());
    expect(options.some((t) => t.kind === "object" && t.object === bears)).toBe(false);
    activate(game, town, 1, { targets: [ref(orc)] });
    expect(counters(game, orc)).toBe(2);
    expect(zone(game, town)).toBe("graveyard");
  });
});

describe("Dwarven Mattock", () => {
  it("attaches itself to target Dwarf you control as it enters: +2/+2", () => {
    const { game, a } = table();
    const dwarf = spawn(game, "Dwarven Trader");
    const other = spawn(game, "Dwarven Trader");
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Dwarven Trader", B);
    const seen = watchTargets(a, () => [dwarf]);
    lands(game, "Wastes", 2);
    const mattock = toHand(game, "Dwarven Mattock");
    cast(game, mattock);
    expect(seen.asked).toBe(1);
    expect([...seen.offered[0]].sort()).toEqual([dwarf, other].sort());
    expect(seen.offered[0]).not.toContain(bears);
    expect(game.state.objects[mattock].attachedTo).toBe(dwarf);
    expect(pt(game, dwarf)).toEqual({ power: 3, toughness: 3 });
  });
});

describe("Loki's Scepter", () => {
  it("steals target creature until end of turn, untapped, a hasty Villain", () => {
    const { game, a } = table();
    const theirs = spawn(game, "Grizzly Bears", B, { tapped: true });
    pickTargets(a, theirs);
    enter(game, "Loki's Scepter");
    expect(controller(game, theirs)).toBe(A);
    expect(game.state.objects[theirs].tapped).toBe(false);
    expect(subtypes(game, theirs)).toEqual(expect.arrayContaining(["Bear", "Villain"]));
    expect(keywords(game, theirs).has("haste")).toBe(true);
    game.advanceUntil((s) => s.turn.number === 2);
    expect(controller(game, theirs)).toBe(B);
    expect(subtypes(game, theirs)).not.toContain("Villain");
  });
});
