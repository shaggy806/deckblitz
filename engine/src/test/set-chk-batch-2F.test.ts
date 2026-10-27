/**
 * Champions of Kamigawa, batch 2 group F: the clauses most likely to be
 * wrong on the cards whose behaviour is more than a copied shape.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  cast,
  counters,
  graveyard,
  keywords,
  lands,
  life,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  zone,
  controller,
} from "./harness.js";

describe("CHK batch 2F", () => {
  it("Mana Seism adds {C} for each land sacrificed", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    const wastes = lands(game, "Wastes", 3);
    pickPermanents(a, ...wastes);
    cast(game, toHand(game, "Mana Seism"));
    for (const w of wastes) expect(zone(game, w)).toBe("graveyard");
    expect(game.state.players[A].manaPool.filter((u) => u.type === "C")).toHaveLength(3);
  });

  it("Junkyo Bell pumps by the creatures you control, then sacrifices at the end step", () => {
    const { game, a } = table();
    spawn(game, "Junkyo Bell");
    const bear = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    pickTargets(a, bear);
    pickModes(a, 0);
    toStep(game, "upkeep");
    settle(game);
    expect(pt(game, bear)).toEqual({ power: 4, toughness: 4 });
    toStep(game, "end");
    settle(game);
    expect(zone(game, bear)).toBe("graveyard");
  });

  it("Junkyo Bell declined does nothing", () => {
    const { game, a } = table();
    spawn(game, "Junkyo Bell");
    const bear = spawn(game, "Grizzly Bears");
    pickTargets(a, bear);
    pickModes(a);
    toStep(game, "upkeep");
    settle(game);
    expect(pt(game, bear)).toEqual({ power: 2, toughness: 2 });
    toStep(game, "end");
    settle(game);
    expect(zone(game, bear)).toBe("battlefield");
  });

  it("Brutal Deceiver gets +1/+0 and first strike on a land, once each turn", () => {
    const { game } = table();
    const deceiver = spawn(game, "Brutal Deceiver");
    lands(game, "Mountain", 4);
    activate(game, deceiver, 1); // the top card is a Wastes
    expect(pt(game, deceiver)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, deceiver).has("first-strike")).toBe(true);
    expect(() => activate(game, deceiver, 1)).toThrow();
  });

  it("Brutal Deceiver gets nothing on a nonland", () => {
    const { game } = table();
    const deceiver = spawn(game, "Brutal Deceiver");
    lands(game, "Mountain", 3);
    const top = toLibrary(game, "Grizzly Bears");
    activate(game, deceiver, 1);
    expect(pt(game, deceiver)).toEqual({ power: 2, toughness: 2 });
    // The look leaves the top card where it is.
    activate(game, deceiver, 0);
    expect(zone(game, top)).toBe("library");
  });

  it("Cruel Deceiver on a land destroys a creature it deals damage to", () => {
    const { game } = table();
    const deceiver = spawn(game, "Cruel Deceiver");
    const wurm = spawn(game, "Craw Wurm", B);
    lands(game, "Swamp", 2);
    lands(game, "Forest", 1);
    activate(game, deceiver, 1);
    cast(game, toHand(game, "Prey Upon"), { targets: [ref(deceiver), ref(wurm)] });
    expect(zone(game, wurm)).toBe("graveyard");
  });

  it("Hisoka's Guard: shroud lasts only while the Guard stays tapped", () => {
    const { game, a } = table();
    const guard = spawn(game, "Hisoka's Guard");
    const bear = spawn(game, "Grizzly Bears");
    lands(game, "Island", 2);
    lands(game, "Wastes", 2);
    expect(() => activate(game, guard, 0, { targets: [ref(guard)] })).toThrow();
    activate(game, guard, 0, { targets: [ref(bear)] });
    expect(keywords(game, bear).has("shroud")).toBe(true);
    pickModes(a, 1); // untap
    cast(game, toHand(game, "Psychic Puppetry"), { targets: [ref(guard)] });
    expect(game.state.objects[guard].tapped).toBe(false);
    expect(keywords(game, bear).has("shroud")).toBe(false);
  });

  it("Blind with Anger can't take a legendary creature", () => {
    const { game } = table();
    const konda = spawn(game, "Konda, Lord of Eiganjo", B);
    const bear = spawn(game, "Grizzly Bears", B, { tapped: true });
    lands(game, "Mountain", 4);
    const spell = toHand(game, "Blind with Anger");
    expect(() => cast(game, spell, { targets: [ref(konda)] })).toThrow();
    cast(game, spell, { targets: [ref(bear)] });
    expect(controller(game, bear)).toBe(A);
    expect(game.state.objects[bear].tapped).toBe(false);
    expect(keywords(game, bear).has("haste")).toBe(true);
  });

  it("Teller of Tales taps a creature when you cast an Arcane spell", () => {
    const { game, a } = table();
    spawn(game, "Teller of Tales");
    const bear = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 1);
    lands(game, "Wastes", 3);
    pickTargets(a, bear);
    pickModes(a, 0);
    cast(game, toHand(game, "Joyous Respite"));
    expect(game.state.objects[bear].tapped).toBe(true);
    expect(life(game)).toBe(24);
  });

  it("Konda's Hatamoto gets +1/+2 and vigilance with a legendary Samurai", () => {
    const { game } = table();
    const hatamoto = spawn(game, "Konda's Hatamoto");
    expect(pt(game, hatamoto)).toEqual({ power: 1, toughness: 2 });
    spawn(game, "Konda, Lord of Eiganjo");
    expect(pt(game, hatamoto)).toEqual({ power: 2, toughness: 4 });
    expect(keywords(game, hatamoto).has("vigilance")).toBe(true);
  });

  it("Pious Kitsune gets a devotion counter each upkeep, spent for life", () => {
    const { game } = table();
    const kitsune = spawn(game, "Pious Kitsune");
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, kitsune, "devotion")).toBe(1);
    const before = life(game);
    activate(game, kitsune, 0);
    expect(life(game)).toBe(before + 1);
    expect(counters(game, kitsune, "devotion")).toBe(0);
  });

  it("Nine-Ringed Bo exiles the Spirit it kills", () => {
    const { game } = table();
    const bo = spawn(game, "Nine-Ringed Bo");
    const spirit = spawn(game, "Cruel Deceiver", B);
    activate(game, bo, 0, { targets: [ref(spirit)] });
    expect(zone(game, spirit)).toBe("exile");
    expect(graveyard(game, B)).toHaveLength(0);
  });
});
