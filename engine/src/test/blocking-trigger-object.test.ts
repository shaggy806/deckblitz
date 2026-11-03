/** `CardFilter.blockingRelation`'s `of: "trigger-object"` — the creatures
 * blocking the object a trigger names, whichever permanent the ability is on
 * (rules 509.1g-h, 608.2h, 701.21a, 400.7): Trailblazer's Torch, Ib Halfheart,
 * Labyrinth Raptor; and each creature blocking the source, Plague Wight. */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import type { BlockerDeclaration, ScriptedController } from "../controller.js";
import { blockingPartnerOf } from "../filter.js";
import {
  A,
  B,
  C,
  activate,
  enter,
  grant,
  lands,
  life,
  named,
  pt,
  ref,
  spawn,
  table,
  zone,
} from "./harness.js";

const blocks =
  (...pairs: readonly (readonly [ObjectId, ObjectId])[]): (() => BlockerDeclaration[]) =>
  () =>
    pairs.map(([blocker, attacker]) => ({ blocker, attacker }));

type G = ReturnType<typeof table>["game"];

const damageOn = (game: G, id: ObjectId): number => game.state.objects[id].damageMarked ?? 0;

/** The trigger on the stack: alice has priority in the declare blockers step
 * with something to resolve. */
const toTriggerOnStack = (game: G): void =>
  game.advanceUntil(
    (s) => s.turn.step === "declare-blockers" && s.priority.holder === A && s.awaiting === null && s.zones.shared.stack.length > 0,
  );

/** The seat sacrifices these, recording what was eligible. */
const pickSacrifices = (seat: ScriptedController, ...ids: readonly ObjectId[]): { offered: readonly ObjectId[] } => {
  const seen = { offered: [] as readonly ObjectId[] };
  seat.chooseSacrificesFn = (_view, eligible) => {
    seen.offered = eligible;
    return ids;
  };
  return seen;
};

/** Back to an empty stack, still in the declare blockers step. */
const toBlocksSettled = (game: G): void =>
  game.advanceUntil(
    (s) => s.turn.step === "declare-blockers" && s.awaiting === null && s.zones.shared.stack.length === 0,
  );

describe("each creature blocking the equipped creature (Trailblazer's Torch)", () => {
  it("takes the initiative as it enters", () => {
    const { game } = table();
    enter(game, "Trailblazer's Torch");
    expect(game.state.initiative).toBe(A);
  });

  it("the equipped creature deals 2 to each creature blocking it, and to no other", () => {
    const { game, a, b } = table();
    const torch = spawn(game, "Trailblazer's Torch");
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[torch].attachedTo = giant;
    const wall = spawn(game, "Wall of Wood", B);
    const elf = spawn(game, "Llanowar Elves", B);
    const other = spawn(game, "Wall of Wood", B);
    const idle = spawn(game, "Wall of Wood", B);
    grant(game, giant, "lifelink");
    b.declareBlockersFn = blocks([wall, giant], [elf, giant], [other, bears]);
    a.declareAttackersFn = () => [
      { attacker: giant, defender: B },
      { attacker: bears, defender: B },
    ];
    toTriggerOnStack(game);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0);
    expect(zone(game, elf)).toBe("graveyard");
    expect(damageOn(game, wall)).toBe(2);
    expect(damageOn(game, other)).toBe(0);
    expect(damageOn(game, idle)).toBe(0);
    // The giant dealt it, so its lifelink counted (2 damage to each of two).
    expect(life(game, A)).toBe(24);
  });

  it("doesn't fire for a creature it isn't on", () => {
    const { game, a, b } = table();
    const torch = spawn(game, "Trailblazer's Torch");
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    game.state.objects[torch].attachedTo = giant;
    const wall = spawn(game, "Wall of Wood", B);
    b.declareBlockersFn = blocks([wall, bears]);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A);
    expect(game.state.zones.shared.stack.length).toBe(0);
    expect(damageOn(game, wall)).toBe(0);
  });
});

describe("sacrifice it, then it deals damage to each creature blocking it (Ib Halfheart)", () => {
  it("the Goblin, gone, still deals 4 to the creatures that were blocking it", () => {
    const { game, a, b } = table();
    spawn(game, "Ib Halfheart, Goblin Tactician");
    const goblin = spawn(game, "Raging Goblin");
    const giant = spawn(game, "Colossal Dreadmaw", B);
    const wall = spawn(game, "Wall of Wood", B);
    const idle = spawn(game, "Wall of Wood", B);
    grant(game, goblin, "lifelink");
    b.declareBlockersFn = blocks([giant, goblin], [wall, goblin]);
    a.declareAttackersFn = () => [{ attacker: goblin, defender: B }];
    toTriggerOnStack(game);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0);
    expect(zone(game, goblin)).toBe("graveyard");
    expect(damageOn(game, giant)).toBe(4);
    expect(zone(game, wall)).toBe("graveyard");
    expect(damageOn(game, idle)).toBe(0);
    // As it last existed (rule 608.2h): lifelink, 4 to each of two.
    expect(life(game, A)).toBe(28);
  });

  it("a Goblin token, which ceases to exist, deals it all the same", () => {
    const { game, a, b } = table();
    const ib = spawn(game, "Ib Halfheart, Goblin Tactician");
    lands(game, "Mountain", 2);
    activate(game, ib);
    const token = named(game, "Goblin Token", A)[0];
    expect(named(game, "Goblin Token", A).length).toBe(2);
    game.state.objects[token].summoningSick = false;
    const giant = spawn(game, "Colossal Dreadmaw", B);
    b.declareBlockersFn = blocks([giant, token]);
    a.declareAttackersFn = () => [{ attacker: token, defender: B }];
    toTriggerOnStack(game);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0);
    expect(damageOn(game, giant)).toBe(4);
    expect(named(game, "Goblin Token", A).length).toBe(1);
  });

  it("Ib itself, and a creature that isn't a Goblin, don't fire it", () => {
    const { game, a, b } = table();
    const ib = spawn(game, "Ib Halfheart, Goblin Tactician");
    const bears = spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Wall of Wood", B);
    const other = spawn(game, "Wall of Wood", B);
    b.declareBlockersFn = blocks([wall, ib], [other, bears]);
    a.declareAttackersFn = () => [
      { attacker: ib, defender: B },
      { attacker: bears, defender: B },
    ];
    game.advanceUntil((s) => s.turn.step === "declare-blockers" && s.priority.holder === A);
    expect(game.state.zones.shared.stack.length).toBe(0);
    expect(zone(game, ib)).toBe("battlefield");
  });

  it("a Goblin flickered in response is a new object: nothing sacrificed, no damage (rule 400.7)", () => {
    const { game, a, b } = table();
    spawn(game, "Ib Halfheart, Goblin Tactician");
    const goblin = spawn(game, "Raging Goblin");
    const giant = spawn(game, "Colossal Dreadmaw", B);
    b.declareBlockersFn = blocks([giant, goblin]);
    a.declareAttackersFn = () => [{ attacker: goblin, defender: B }];
    toTriggerOnStack(game);
    game.debugApplyEffect(A, { kind: "flicker", target: 0 }, [ref(goblin)]);
    toBlocksSettled(game);
    expect(named(game, "Raging Goblin", A).length).toBe(1);
    expect(damageOn(game, giant)).toBe(0);
  });

  it("a Goblin someone else has taken stays: no sacrifice, so no damage (rule 701.21a)", () => {
    const { game, a, b } = table();
    spawn(game, "Ib Halfheart, Goblin Tactician");
    const goblin = spawn(game, "Raging Goblin");
    const giant = spawn(game, "Colossal Dreadmaw", B);
    b.declareBlockersFn = blocks([giant, goblin]);
    a.declareAttackersFn = () => [{ attacker: goblin, defender: B }];
    toTriggerOnStack(game);
    game.debugApplyEffect(B, { kind: "gain-control", target: 0, untilEndOfTurn: false }, [ref(goblin)]);
    toBlocksSettled(game);
    expect(zone(game, goblin)).toBe("battlefield");
    expect(damageOn(game, giant)).toBe(0);
  });
});

describe("a creature of their choice that's blocking it (Labyrinth Raptor)", () => {
  it("the defending player chooses among those blocking that creature alone", () => {
    const { game, a, b } = table();
    const raptor = spawn(game, "Labyrinth Raptor");
    const bears = spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Wall of Wood", B);
    const elf = spawn(game, "Llanowar Elves", B);
    const other = spawn(game, "Wall of Wood", B);
    const idle = spawn(game, "Wall of Wood", B);
    b.declareBlockersFn = blocks([wall, raptor], [elf, raptor], [other, bears]);
    a.declareAttackersFn = () => [
      { attacker: raptor, defender: B },
      { attacker: bears, defender: B },
    ];
    const seen = pickSacrifices(b, wall);
    toTriggerOnStack(game);
    toBlocksSettled(game);
    expect([...seen.offered].sort()).toEqual([wall, elf].sort());
    expect(seen.offered).not.toContain(idle);
    expect(zone(game, wall)).toBe("graveyard");
    expect(zone(game, elf)).toBe("battlefield");
    expect(zone(game, other)).toBe("battlefield");
  });

  it("fires for another creature with menace, and for no creature without it", () => {
    const { game, a, b } = table();
    spawn(game, "Labyrinth Raptor");
    const giant = spawn(game, "Hill Giant");
    const bears = spawn(game, "Grizzly Bears");
    grant(game, giant, "menace");
    const wall = spawn(game, "Wall of Wood", B);
    const elf = spawn(game, "Llanowar Elves", B);
    const other = spawn(game, "Wall of Wood", B);
    b.declareBlockersFn = blocks([wall, giant], [elf, giant], [other, bears]);
    a.declareAttackersFn = () => [
      { attacker: giant, defender: B },
      { attacker: bears, defender: B },
    ];
    pickSacrifices(b, elf);
    toTriggerOnStack(game);
    toBlocksSettled(game);
    expect(zone(game, elf)).toBe("graveyard");
    expect(zone(game, wall)).toBe("battlefield");
    // The bears weren't made to shed their blocker.
    expect(zone(game, other)).toBe("battlefield");
  });

  it("in a four-player game the player being attacked is the one who sacrifices", () => {
    const { game, a, c } = table({ players: 4 });
    const raptor = spawn(game, "Labyrinth Raptor");
    const wall = spawn(game, "Wall of Wood", C);
    const elf = spawn(game, "Llanowar Elves", C);
    const bystander = spawn(game, "Wall of Wood", B);
    c.declareBlockersFn = blocks([wall, raptor], [elf, raptor]);
    a.declareAttackersFn = () => [{ attacker: raptor, defender: C }];
    const seen = pickSacrifices(c, elf);
    toTriggerOnStack(game);
    toBlocksSettled(game);
    expect([...seen.offered].sort()).toEqual([wall, elf].sort());
    expect(zone(game, elf)).toBe("graveyard");
    expect(zone(game, bystander)).toBe("battlefield");
  });

  it("{B}{R} pumps the creatures with menace you control, until end of turn", () => {
    const { game } = table();
    const raptor = spawn(game, "Labyrinth Raptor");
    const giant = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Labyrinth Raptor", B);
    lands(game, "Swamp", 1);
    lands(game, "Mountain", 1);
    activate(game, raptor);
    expect(pt(game, raptor)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, giant)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("each creature blocking it gets -1/-1 (Plague Wight)", () => {
  it("shrinks each of its blockers and nothing else, as the trigger resolves", () => {
    const { game, a, b } = table();
    const wight = spawn(game, "Plague Wight");
    const bears = spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Wall of Wood", B);
    const elf = spawn(game, "Llanowar Elves", B);
    const other = spawn(game, "Wall of Wood", B);
    b.declareBlockersFn = blocks([wall, wight], [elf, wight], [other, bears]);
    a.declareAttackersFn = () => [
      { attacker: wight, defender: B },
      { attacker: bears, defender: B },
    ];
    toTriggerOnStack(game);
    game.advanceUntil((s) => s.zones.shared.stack.length === 0);
    expect(pt(game, wall)).toEqual({ power: -1, toughness: 2 });
    expect(zone(game, elf)).toBe("graveyard");
    expect(pt(game, other)).toEqual({ power: 0, toughness: 3 });
  });
});

describe("the clause outside a resolution", () => {
  it("has no trigger object to read, so no partner", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    expect(blockingPartnerOf(game.state, "trigger-object", bears)).toBeUndefined();
    expect(blockingPartnerOf(game.state, "source", bears)).toBe(bears);
  });
});
