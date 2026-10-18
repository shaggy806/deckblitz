/**
 * March of the Machine, batch 2: the convoke cards — "for each creature that
 * convoked it" read by the permanent a convoked spell became, and "whenever
 * you cast a spell that has convoke". Written from the Oracle text and
 * rulings.
 */
import { describe, expect, it } from "vitest";

import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  cast,
  counters,
  hand,
  lands,
  life,
  pickFromZone,
  spawn,
  table,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

/** Invasion of Lorwyn, cast by A: a battle B protects. */
function invadeHelper(game: Parameters<typeof lands>[0]): ObjectId {
  lands(game, "Swamp", 3);
  lands(game, "Forest", 3);
  const battle = toHand(game, "Invasion of Lorwyn");
  cast(game, battle);
  return battle;
}

const convokeWith = (creatures: readonly ObjectId[]) => ({
  convoke: creatures.map((creature) => ({ creature, pays: "generic" as const })),
});

describe("Ancient Imperiosaur", () => {
  it("enters with two +1/+1 counters for each creature that convoked it", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const bears = [spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears"), spawn(game, "Grizzly Bears")];
    const dino = toHand(game, "Ancient Imperiosaur");
    cast(game, dino, convokeWith(bears));
    expect(zone(game, dino)).toBe("battlefield");
    expect(counters(game, dino)).toBe(6);
  });

  it("cast with mana alone, it enters with none", () => {
    const { game } = table();
    lands(game, "Forest", 7);
    const dino = toHand(game, "Ancient Imperiosaur");
    cast(game, dino);
    expect(counters(game, dino)).toBe(0);
  });
});

describe("Zephyr Singer", () => {
  it("puts a flying counter on each creature that convoked it, and no other", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const helpers = [spawn(game, "Grizzly Bears"), spawn(game, "Llanowar Elves")];
    const bystander = spawn(game, "Hill Giant");
    const singer = toHand(game, "Zephyr Singer");
    cast(game, singer, convokeWith(helpers));
    for (const id of helpers) expect(counters(game, id, "flying")).toBe(1);
    expect(counters(game, bystander, "flying")).toBe(0);
    expect(counters(game, singer, "flying")).toBe(0);
  });
});

describe("Knight-Errant of Eos", () => {
  it("X is the number of creatures that convoked it", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    const helpers = [spawn(game, "Grizzly Bears"), spawn(game, "Llanowar Elves")];
    const cheap = toLibrary(game, "Grizzly Bears");
    const pricey = toLibrary(game, "Hill Giant");
    const seen = pickFromZone(a, cheap);
    cast(game, toHand(game, "Knight-Errant of Eos"), convokeWith(helpers));
    expect(seen.offered).toContain(cheap);
    expect(seen.offered).not.toContain(pricey);
    expect(zone(game, cheap)).toBe("hand");
  });
});

describe("Kasla, the Broken Halo", () => {
  it("scries 2 and draws for a spell that has convoke, even with nothing tapped for it", () => {
    const { game } = table();
    spawn(game, "Kasla, the Broken Halo");
    for (let i = 0; i < 4; i += 1) toLibrary(game, "Wastes");
    lands(game, "Island", 3);
    const squad = toHand(game, "Referee Squad");
    const before = hand(game).length;
    cast(game, squad);
    // The Squad left the hand; Kasla's draw replaced it.
    expect(hand(game).length).toBe(before);
  });

  it("doesn't trigger on a spell without convoke", () => {
    const { game } = table();
    spawn(game, "Kasla, the Broken Halo");
    for (let i = 0; i < 4; i += 1) toLibrary(game, "Wastes");
    lands(game, "Forest", 2);
    const before = hand(game).length;
    cast(game, toHand(game, "Grizzly Bears"));
    expect(hand(game).length).toBe(before);
  });
});

describe("Saint Traft and Rem Karolus", () => {
  it("tapped to convoke and untapped by the convoke spell: a Human, a Spirit, an Angel, then nothing", () => {
    const { game } = table();
    const traft = spawn(game, "Saint Traft and Rem Karolus");
    lands(game, "Island", 8);
    for (let i = 0; i < 4; i += 1) cast(game, toHand(game, "Referee Squad"), convokeWith([traft]));
    expect(tokensNamed(game, "Red Human Token", A)).toBe(1);
    expect(tokensNamed(game, "Spirit Token (Saint Traft and Rem Karolus)", A)).toBe(1);
    expect(tokensNamed(game, "4/4 Angel Token", A)).toBe(1);
    expect(game.state.objects[traft].tapped).toBe(false);
  });
});

describe("Joyful Stormsculptor", () => {
  it("a spell that has convoke deals 1 to each opponent and each battle they protect", () => {
    const { game } = table();
    const battle = invadeHelper(game);
    spawn(game, "Joyful Stormsculptor");
    lands(game, "Island", 3);
    cast(game, toHand(game, "Referee Squad"));
    expect(life(game, B)).toBe(19);
    expect(counters(game, battle, "defense")).toBe(4);
    expect(life(game, A)).toBe(20);
  });
});
