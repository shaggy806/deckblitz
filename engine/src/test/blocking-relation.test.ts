/** `CardFilter.blockingRelation` — creatures blocking, or blocked by, the
 * source or its host (rules 509.1g-h, 506.4, 608.2b, 608.2h): Goblin
 * Javelineer, Tinder Wall, Plasma Caster, Wall of Nets, Kjeldoran
 * Frostbeast, Coils of the Medusa and Battle-Scarred Goblin. */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import type { BlockerDeclaration } from "../controller.js";
import {
  A,
  B,
  activate,
  attack,
  destroy,
  lands,
  ref,
  spawn,
  table,
  toStep,
  watchTargets,
  zone,
} from "./harness.js";

const blocks =
  (...pairs: readonly (readonly [ObjectId, ObjectId])[]): (() => BlockerDeclaration[]) =>
  () =>
    pairs.map(([blocker, attacker]) => ({ blocker, attacker }));

type G = ReturnType<typeof table>["game"];

/** `who` holds priority in alice's declare blockers step, the stack empty —
 * the blocks' triggers resolved. */
const toBlockersWith = (game: G, who = B): void =>
  game.advanceUntil(
    (s) =>
      s.turn.step === "declare-blockers" &&
      s.priority.holder === who &&
      s.awaiting === null &&
      s.zones.shared.stack.length === 0,
  );
const toBlockersWithBob = (game: G): void => toBlockersWith(game, B);

describe("target creature blocking it (Goblin Javelineer)", () => {
  it("offers only the creatures blocking it, and deals 1 to the one chosen", () => {
    const { game, a, b } = table();
    const javelineer = spawn(game, "Goblin Javelineer");
    const bears = spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Wall of Wood", B);
    const elf = spawn(game, "Llanowar Elves", B);
    const bystander = spawn(game, "Llanowar Elves", B);
    b.declareBlockersFn = blocks([wall, javelineer], [elf, javelineer]);
    const seen = watchTargets(a, () => [elf]);
    attack(game, a, [javelineer, bears]);
    expect(seen.asked).toBe(1);
    expect([...seen.offered[0]].sort()).toEqual([wall, elf].sort());
    expect(seen.offered[0]).not.toContain(bystander);
    expect(zone(game, elf)).toBe("graveyard");
    expect(zone(game, bystander)).toBe("battlefield");
  });

  it("a creature blocking another attacker isn't blocking it", () => {
    const { game, a, b } = table();
    const javelineer = spawn(game, "Goblin Javelineer");
    const bears = spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Wall of Wood", B);
    const elf = spawn(game, "Llanowar Elves", B);
    b.declareBlockersFn = blocks([wall, javelineer], [elf, bears]);
    a.declareAttackersFn = () => [
      { attacker: javelineer, defender: B },
      { attacker: bears, defender: B },
    ];
    toBlockersWith(game, A);
    // The Wall, its only legal target, took the 1; the Elves blocking the
    // Bears took nothing.
    expect(game.state.objects[wall].damageMarked).toBe(1);
    expect(game.state.objects[elf].damageMarked).toBe(0);
  });
});

describe("target creature it's blocking (Tinder Wall)", () => {
  it("sacrificed as the cost, it still deals 2 to the attacker it was blocking", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Tinder Wall", B);
    lands(game, "Mountain", 1, B);
    b.declareBlockersFn = blocks([wall, bears]);
    a.declareAttackersFn = () => [
      { attacker: bears, defender: B },
      { attacker: other, defender: B },
    ];
    toBlockersWithBob(game);
    activate(game, wall, 1, { player: B, targets: [ref(bears)] });
    expect(zone(game, wall)).toBe("graveyard");
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, other)).toBe("battlefield");
  });

  it("an attacker it isn't blocking can't be targeted", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Tinder Wall", B);
    lands(game, "Mountain", 1, B);
    b.declareBlockersFn = blocks([wall, bears]);
    a.declareAttackersFn = () => [
      { attacker: bears, defender: B },
      { attacker: other, defender: B },
    ];
    toBlockersWithBob(game);
    expect(() => activate(game, wall, 1, { player: B, targets: [ref(other)] })).toThrow(/target/i);
    expect(zone(game, wall)).toBe("battlefield");
  });

  it("an attacker removed from combat is no longer one it's blocking (rule 506.4)", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears");
    const wall = spawn(game, "Tinder Wall", B);
    lands(game, "Mountain", 1, B);
    b.declareBlockersFn = blocks([wall, bears]);
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    toBlockersWithBob(game);
    game.state.objects[bears].attacking = null;
    game.state.objects[bears].blockedBy = [];
    expect(() => activate(game, wall, 1, { player: B, targets: [ref(bears)] })).toThrow(/target/i);
  });
});

describe("target creature that's blocking equipped creature (Plasma Caster)", () => {
  it("is a creature blocking the host, and the flip either exiles it or deals 1", () => {
    const { game, a, b } = table();
    const caster = spawn(game, "Plasma Caster");
    const bears = spawn(game, "Grizzly Bears");
    const other = spawn(game, "Grizzly Bears");
    game.state.objects[caster].attachedTo = bears;
    const wall = spawn(game, "Wall of Wood", B);
    const elf = spawn(game, "Llanowar Elves", B);
    b.declareBlockersFn = blocks([wall, bears], [elf, other]);
    a.declareAttackersFn = () => [
      { attacker: bears, defender: B },
      { attacker: other, defender: B },
    ];
    toStep(game, "declare-blockers");
    // The attack trigger gave alice {E}{E}.
    expect(game.state.players[A].energy).toBe(2);
    expect(() => activate(game, caster, 0, { targets: [ref(elf)] })).toThrow(/target/i);
    activate(game, caster, 0, { targets: [ref(wall)] });
    const exiled = zone(game, wall) === "exile";
    expect(exiled || game.state.objects[wall].damageMarked === 1).toBe(true);
    expect(game.state.players[A].energy).toBe(0);
  });
});

describe("all creatures blocked by this creature (Wall of Nets)", () => {
  it("exiles the attackers it blocked at end of combat, and returns them as it leaves", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears");
    const giant = spawn(game, "Hill Giant");
    const other = spawn(game, "Grizzly Bears");
    const nets = spawn(game, "Wall of Nets", B);
    const elf = spawn(game, "Llanowar Elves", B);
    b.declareBlockersFn = blocks([nets, bears], [elf, other]);
    attack(game, a, [bears, giant, other]);
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, giant)).toBe("battlefield");
    // The Bears the Elves blocked stay: Wall of Nets exiles only what it blocked.
    expect(zone(game, other)).toBe("battlefield");
    destroy(game, nets);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("all creatures blocking or blocked by this creature (Kjeldoran Frostbeast)", () => {
  it("destroys its blockers when it attacks", () => {
    const { game, a, b } = table();
    const beast = spawn(game, "Kjeldoran Frostbeast");
    const wall = spawn(game, "Wall of Wood", B);
    const elf = spawn(game, "Llanowar Elves", B);
    const bystander = spawn(game, "Wall of Wood", B);
    b.declareBlockersFn = blocks([wall, beast]);
    attack(game, a, [beast]);
    expect(zone(game, wall)).toBe("graveyard");
    expect(zone(game, elf)).toBe("battlefield");
    expect(zone(game, bystander)).toBe("battlefield");
    expect(zone(game, beast)).toBe("battlefield");
  });

  it("destroys the attacker it blocks", () => {
    const { game, a, b } = table();
    const wall = spawn(game, "Wall of Wood");
    const beast = spawn(game, "Kjeldoran Frostbeast", B);
    const bears = spawn(game, "Grizzly Bears");
    void wall;
    b.declareBlockersFn = blocks([beast, bears]);
    attack(game, a, [bears]);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, beast)).toBe("battlefield");
  });
});

describe("all non-Wall creatures blocking enchanted creature (Coils of the Medusa)", () => {
  it("sacrificed, destroys the host's non-Wall blockers and nothing else", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant");
    const other = spawn(game, "Hill Giant");
    const coils = spawn(game, "Coils of the Medusa");
    game.state.objects[coils].attachedTo = giant;
    const elf = spawn(game, "Llanowar Elves", B);
    const wall = spawn(game, "Wall of Wood", B);
    const elsewhere = spawn(game, "Llanowar Elves", B);
    b.declareBlockersFn = blocks([elf, giant], [wall, giant], [elsewhere, other]);
    a.declareAttackersFn = () => [
      { attacker: giant, defender: B },
      { attacker: other, defender: B },
    ];
    toStep(game, "declare-blockers");
    activate(game, coils, 0);
    expect(zone(game, coils)).toBe("graveyard");
    expect(zone(game, elf)).toBe("graveyard");
    expect(zone(game, wall)).toBe("battlefield");
    expect(zone(game, elsewhere)).toBe("battlefield");
  });
});

describe("each creature blocking it (Battle-Scarred Goblin)", () => {
  it("deals 1 to each of its blockers and no other", () => {
    const { game, a, b } = table();
    const goblin = spawn(game, "Battle-Scarred Goblin");
    const bears = spawn(game, "Grizzly Bears");
    const elf = spawn(game, "Llanowar Elves", B);
    const elf2 = spawn(game, "Llanowar Elves", B);
    const elsewhere = spawn(game, "Llanowar Elves", B);
    const wall = spawn(game, "Wall of Wood", B);
    b.declareBlockersFn = blocks([elf, goblin], [elf2, goblin], [wall, bears]);
    a.declareAttackersFn = () => [
      { attacker: goblin, defender: B },
      { attacker: bears, defender: B },
    ];
    toBlockersWith(game, A);
    expect(zone(game, elf)).toBe("graveyard");
    expect(zone(game, elf2)).toBe("graveyard");
    expect(game.state.objects[wall].damageMarked).toBe(0);
    expect(game.state.objects[elsewhere].damageMarked).toBe(0);
  });
});
