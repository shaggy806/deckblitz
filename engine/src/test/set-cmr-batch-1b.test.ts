/**
 * The set walk, Commander Legends batch 1, part b (2026-10-20): the clauses
 * most likely to be wrong on this group's cards. Written on the shared table
 * in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  destroy,
  enter,
  graveyard,
  hand,
  lands,
  life,
  named,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Archelos, Lagoon Mystic", () => {
  it("while tapped, another permanent enters tapped", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    spawn(game, "Archelos, Lagoon Mystic", A, { tapped: true });
    cast(game, toHand(game, "Grizzly Bears"));
    const [bears] = named(game, "Grizzly Bears");
    expect(game.state.objects[bears].tapped).toBe(true);
  });

  it("while untapped, a land that enters tapped enters untapped", () => {
    const { game } = table();
    spawn(game, "Archelos, Lagoon Mystic");
    const gate = toHand(game, "Azorius Guildgate");
    game.dispatch({ type: "play-land", player: A, card: gate });
    settle(game);
    expect(zone(game, gate)).toBe("battlefield");
    expect(game.state.objects[gate].tapped).toBe(false);
  });
});

describe("Demonic Lore", () => {
  it("draws three, then costs 2 life per card in hand at your end step", () => {
    const { game } = table();
    const before = hand(game).length;
    enter(game, "Demonic Lore");
    expect(hand(game).length).toBe(before + 3);
    toStep(game, "end");
    settle(game);
    expect(hand(game).length).toBeGreaterThan(0);
    expect(life(game)).toBe(20 - 2 * hand(game).length);
  });
});

describe("Nadier, Agent of the Duskenel", () => {
  it("leaving to exile makes Elf Warriors equal to its last power", () => {
    const { game } = table();
    const nadier = spawn(game, "Nadier, Agent of the Duskenel");
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 }, [ref(nadier)]);
    game.debugApplyEffect(B, { kind: "exile", target: 0 }, [ref(nadier)]);
    settle(game);
    expect(tokensNamed(game, "Elf Warrior Token", A)).toBe(5);
  });
});

describe("Elvish Dreadlord", () => {
  it("dying shrinks non-Elf creatures only", () => {
    const { game } = table();
    const lord = spawn(game, "Elvish Dreadlord");
    const bears = spawn(game, "Grizzly Bears", B);
    const elves = spawn(game, "Llanowar Elves", B);
    destroy(game, lord);
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, elves)).toBe("battlefield");
  });
});

describe("Eyeblight Cullers", () => {
  it("dying makes three Elf Warriors, then mills three", () => {
    const { game } = table();
    const cullers = spawn(game, "Eyeblight Cullers");
    destroy(game, cullers);
    expect(tokensNamed(game, "Elf Warrior Token", A)).toBe(3);
    expect(graveyard(game).length).toBe(4);
  });
});

describe("Triumphant Reckoning", () => {
  it("returns artifacts, enchantments and planeswalkers, not creatures", () => {
    const { game } = table();
    const ring = toGraveyard(game, "Sol Ring");
    const jace = toGraveyard(game, "Jace Beleren");
    const lore = toGraveyard(game, "Demonic Lore");
    const bears = toGraveyard(game, "Grizzly Bears");
    lands(game, "Plains", 9);
    cast(game, toHand(game, "Triumphant Reckoning"));
    expect(zone(game, ring)).toBe("battlefield");
    expect(zone(game, jace)).toBe("battlefield");
    expect(zone(game, lore)).toBe("battlefield");
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Seraphic Greatsword", () => {
  it("attacking the player tied for most life makes an attacking Angel", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears");
    const sword = spawn(game, "Seraphic Greatsword");
    lands(game, "Wastes", 4);
    activate(game, sword, 0, { targets: [ref(bears)] });
    attack(game, a, [bears]);
    expect(tokensNamed(game, "4/4 Angel Token", A)).toBe(1);
    expect(life(game, B)).toBe(20 - 4 - 4);
  });

  it("does nothing against a player without the most life", () => {
    const { game, a } = table();
    game.state.players[B].life = 10;
    const bears = spawn(game, "Grizzly Bears");
    const sword = spawn(game, "Seraphic Greatsword");
    lands(game, "Wastes", 4);
    activate(game, sword, 0, { targets: [ref(bears)] });
    attack(game, a, [bears]);
    expect(tokensNamed(game, "4/4 Angel Token", A)).toBe(0);
    expect(life(game, B)).toBe(10 - 4);
  });
});
