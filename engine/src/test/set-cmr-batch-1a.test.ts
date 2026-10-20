/**
 * The set walk, Commander Legends batch 1, part a (2026-10-20): Colfenor's
 * lesser-toughness return, Miara's pay-to-draw, Fathom Fleet Swordjack's
 * attack damage, Captain Vargus Wrath's commander-cast pump and Anointer of
 * Valor's reflexive counter. Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  attack,
  counters,
  destroy,
  hand,
  lands,
  life,
  pickModes,
  pt,
  spawn,
  table,
  toGraveyard,
  watchTargets,
  zone,
} from "./harness.js";

describe("Colfenor, the Last Yew", () => {
  it("returns a creature card with lesser toughness than the one that died — never that card, nor an equal one", () => {
    const { game, a } = table();
    spawn(game, "Colfenor, the Last Yew");
    const giant = spawn(game, "Hill Giant");
    const bears = toGraveyard(game, "Grizzly Bears");
    const otherGiant = toGraveyard(game, "Hill Giant");
    const seen = watchTargets(a, () => [bears]);
    destroy(game, giant);
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toContain(bears);
    expect(seen.offered[0]).not.toContain(otherGiant);
    expect(seen.offered[0]).not.toContain(giant);
    expect(zone(game, bears)).toBe("hand");
    expect(zone(game, otherGiant)).toBe("graveyard");
  });

  it("triggers on its own death, reading its toughness as it last was", () => {
    const { game, a } = table();
    const colfenor = spawn(game, "Colfenor, the Last Yew");
    const giant = toGraveyard(game, "Hill Giant");
    const seen = watchTargets(a, () => [giant]);
    destroy(game, colfenor);
    expect(seen.offered[0]).toContain(giant);
    expect(seen.offered[0]).not.toContain(colfenor);
    expect(zone(game, giant)).toBe("hand");
  });
});

describe("Miara, Thorn of the Glade", () => {
  it("pays {1} and 1 life to draw when an Elf you control dies, and when she does", () => {
    const { game, a } = table();
    const miara = spawn(game, "Miara, Thorn of the Glade");
    const elf = spawn(game, "Llanowar Elves");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Swamp", 2);
    pickModes(a, 0);
    const before = hand(game).length;
    destroy(game, bears);
    expect(hand(game).length).toBe(before);
    destroy(game, elf);
    expect(hand(game).length).toBe(before + 1);
    expect(life(game)).toBe(19);
    destroy(game, miara);
    expect(hand(game).length).toBe(before + 2);
    expect(life(game)).toBe(18);
  });
});

describe("Fathom Fleet Swordjack", () => {
  it("deals the player it attacks damage equal to the artifacts you control", () => {
    const { game, a } = table();
    const jack = spawn(game, "Fathom Fleet Swordjack");
    spawn(game, "Sol Ring");
    spawn(game, "Ornithopter");
    attack(game, a, [jack]);
    // 2 from the trigger, 4 combat.
    expect(life(game, B)).toBe(14);
  });
});

describe("Captain Vargus Wrath", () => {
  it("pumps Pirates you control +1/+1 per command-zone cast as it attacks", () => {
    const { game, a } = table();
    const vargus = spawn(game, "Captain Vargus Wrath");
    const jack = spawn(game, "Fathom Fleet Swordjack");
    const bears = spawn(game, "Grizzly Bears");
    game.state.players[A].commanderCastCounts = { "Captain Vargus Wrath": 2 };
    attack(game, a, [vargus]);
    expect(pt(game, vargus)).toEqual({ power: 3, toughness: 3 });
    expect(pt(game, jack)).toEqual({ power: 6, toughness: 5 });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Anointer of Valor", () => {
  it("puts a counter on an attacking creature for {3}", () => {
    const { game, a } = table();
    spawn(game, "Anointer of Valor");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 3);
    pickModes(a, 0);
    attack(game, a, [bears]);
    expect(counters(game, bears)).toBe(1);
    expect(life(game, B)).toBe(17);
  });
});
