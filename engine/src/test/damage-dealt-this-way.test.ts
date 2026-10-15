/**
 * "Damage dealt this way": the resolution's own damage, after prevention
 * (rule 615.1) — a prevented hit was never dealt. The `damageDealtThisWay`
 * amount and the `damage-dealt-this-way` condition read it off the
 * resolution's damage events.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  cast,
  enter,
  hand,
  lands,
  life,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  zone,
} from "./harness.js";

/** Prevent all damage that would be dealt to `id` this turn. */
const shield = (game: Game, id: PlayerId | ObjectId): void => {
  game.debugApplyEffect(A, { kind: "prevent-damage", target: 0, amount: "all" }, [ref(id)]);
};

describe("damage dealt this way", () => {
  it("Provoke the Trolls pumps a creature it dealt damage to, and only then", () => {
    const { game } = table();
    lands(game, "Mountain", 8);
    const wurm = spawn(game, "Craw Wurm", B); // 6/4
    cast(game, toHand(game, "Provoke the Trolls"), { targets: [ref(wurm)] });
    expect(pt(game, wurm)).toEqual({ power: 11, toughness: 4 });
    // The damage prevented: no +5/+0.
    const other = spawn(game, "Craw Wurm", B);
    shield(game, other);
    cast(game, toHand(game, "Provoke the Trolls"), { targets: [ref(other)] });
    expect(pt(game, other)).toEqual({ power: 6, toughness: 4 });
    expect(game.state.objects[other].damageMarked ?? 0).toBe(0);
  });

  it("The Black Arrow destroys a Dragon it dealt damage to, not one the damage was prevented to", () => {
    const { game, a } = table();
    const dragon = spawn(game, "Shivan Dragon", B);
    pickTargets(a, dragon);
    enter(game, "The Black Arrow");
    expect(zone(game, dragon)).toBe("graveyard");
    // Not a Dragon: just the 1 damage.
    const wurm = spawn(game, "Craw Wurm", B);
    pickTargets(a, wurm);
    enter(game, "The Black Arrow");
    expect(zone(game, wurm)).toBe("battlefield");
    expect(game.state.objects[wurm].damageMarked).toBe(1);
    const shielded = spawn(game, "Shivan Dragon", B);
    shield(game, shielded);
    pickTargets(a, shielded);
    enter(game, "The Black Arrow");
    expect(zone(game, shielded)).toBe("battlefield");
  });

  it("Sonic Shrieker makes a player it dealt damage to discard", () => {
    const { game, a } = table();
    toHand(game, "Grizzly Bears", B);
    const cards = hand(game, B).length;
    const before = life(game, A);
    pickTargets(a, B);
    enter(game, "Sonic Shrieker");
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(before + 2);
    expect(hand(game, B)).toHaveLength(cards - 1);
    // A creature dealt the damage: nobody discards.
    const wurm = spawn(game, "Craw Wurm", B);
    pickTargets(a, wurm);
    enter(game, "Sonic Shrieker");
    expect(hand(game, B)).toHaveLength(cards - 1);
    // The damage to the player prevented: no discard.
    shield(game, B);
    pickTargets(a, B);
    enter(game, "Sonic Shrieker");
    expect(life(game, B)).toBe(18);
    expect(hand(game, B)).toHaveLength(cards - 1);
  });

  it("Creeping Bloodsucker gains the damage actually dealt", () => {
    const { game } = table({ players: 3 });
    spawn(game, "Creeping Bloodsucker");
    toStep(game, "upkeep");
    // Bob's damage prevented; Carol's dealt.
    shield(game, B);
    const before = life(game, A);
    settle(game);
    expect(life(game, B)).toBe(20);
    expect(life(game, C)).toBe(19);
    expect(life(game, A)).toBe(before + 1);
  });

  it("Elektra's reflexive trigger only when the damage to you was dealt", () => {
    const { game, a } = table();
    const wurm = spawn(game, "Craw Wurm", B);
    pickModes(a, 0);
    pickTargets(a, wurm);
    enter(game, "Elektra, Femme Fatale");
    expect(life(game, A)).toBe(18);
    expect(zone(game, wurm)).toBe("graveyard");
    // Prevented: no "when you do".
    const other = spawn(game, "Craw Wurm", B);
    shield(game, A);
    pickTargets(a, other);
    enter(game, "Elektra, Femme Fatale");
    expect(life(game, A)).toBe(18);
    expect(zone(game, other)).toBe("battlefield");
    // Declined: nothing.
    pickModes(a);
    const third = spawn(game, "Craw Wurm", B);
    pickTargets(a, third);
    enter(game, "Elektra, Femme Fatale");
    expect(zone(game, third)).toBe("battlefield");
  });
});
