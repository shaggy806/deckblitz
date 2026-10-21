/**
 * Limited Edition Alpha, group C: the clause of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  destroy,
  lands,
  life,
  nextTurn,
  pickModes,
  ref,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;

describe("Twiddle", () => {
  it("untaps the target when the caster picks untap as it resolves", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    const forest = spawn(game, "Forest", A, { tapped: true });
    pickModes(a, 1);
    cast(game, toHand(game, "Twiddle"), { targets: [ref(forest)] });
    expect(tapped(game, forest)).toBe(false);
  });

  it("may do neither", () => {
    const { game, a } = table();
    lands(game, "Island", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a);
    cast(game, toHand(game, "Twiddle"), { targets: [ref(bears)] });
    expect(tapped(game, bears)).toBe(false);
  });
});

describe("Wanderlust", () => {
  it("deals 1 damage to the enchanted creature's controller on their upkeep only", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Wanderlust"), { targets: [ref(bears)] });
    nextTurn(game, "draw"); // bob's turn
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(20);
    nextTurn(game, "draw"); // alice's turn: not the enchanted creature's controller
    expect(life(game, B)).toBe(19);
    expect(life(game, A)).toBe(20);
  });
});

describe("Paralyze", () => {
  it("taps the creature; its controller may pay {4} on their upkeep to untap it", () => {
    const { game, b } = table();
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 4, B);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Paralyze"), { targets: [ref(bears)] });
    expect(tapped(game, bears)).toBe(true);
    pickModes(b, 0);
    nextTurn(game, "draw"); // bob's turn: it didn't untap in the untap step, then he paid
    expect(tapped(game, bears)).toBe(false);
    expect(game.battlefield.filter((id) => game.state.objects[id].controller === B && tapped(game, id))).toHaveLength(4);
  });

  it("stays tapped when the player declines", () => {
    const { game, b } = table();
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 4, B);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Paralyze"), { targets: [ref(bears)] });
    pickModes(b);
    nextTurn(game, "draw");
    expect(tapped(game, bears)).toBe(true);
  });
});

describe("Living Artifact", () => {
  it("gets a vitality counter per damage dealt to you, and trades one for 1 life on your upkeep", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    lands(game, "Mountain", 1);
    const tablet = spawn(game, "Sol Ring", B);
    const aura = toHand(game, "Living Artifact");
    cast(game, aura, { targets: [ref(tablet)] });
    cast(game, toHand(game, "Shock"), { targets: [ref(A)] });
    expect(life(game, A)).toBe(18);
    expect(counters(game, aura, "vitality")).toBe(2);
    pickModes(a, 0);
    nextTurn(game, "draw"); // bob's upkeep: not yours
    expect(counters(game, aura, "vitality")).toBe(2);
    nextTurn(game, "draw"); // alice's upkeep
    expect(counters(game, aura, "vitality")).toBe(1);
    expect(life(game, A)).toBe(19);
  });
});

describe("Scavenging Ghoul", () => {
  it("counts every creature that died this turn, whoever's, and regenerates off a counter", () => {
    const { game } = table();
    const ghoul = spawn(game, "Scavenging Ghoul");
    destroy(game, spawn(game, "Grizzly Bears"));
    destroy(game, spawn(game, "Grizzly Bears", B));
    nextTurn(game, "upkeep");
    expect(counters(game, ghoul, "corpse")).toBe(2);
    nextTurn(game); // alice's turn 3: nothing died on bob's turn
    expect(counters(game, ghoul, "corpse")).toBe(2);
    activate(game, ghoul, 0);
    destroy(game, ghoul);
    expect(zone(game, ghoul)).toBe("battlefield");
    expect(counters(game, ghoul, "corpse")).toBe(1);
  });
});
