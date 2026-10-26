/**
 * Saviors of Kamigawa / Betrayers of Kamigawa, batch 202, group E
 * (2026-10-26). Written on the shared table in `harness.ts`, each test from
 * the card's Oracle text.
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
  pickFromZone,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  types,
  zone,
} from "./harness.js";

describe("Deathknell Kami", () => {
  it("gets +1/+1 and is sacrificed at the beginning of the next end step", () => {
    const { game } = table();
    const kami = spawn(game, "Deathknell Kami");
    lands(game, "Swamp", 2);
    activate(game, kami);
    expect(pt(game, kami)).toEqual({ power: 1, toughness: 2 });
    toStep(game, "end");
    settle(game);
    expect(zone(game, kami)).toBe("graveyard");
  });
});

describe("Sokenzan Spellblade", () => {
  it("gets +X/+0 where X is the cards in your hand as it resolves", () => {
    const { game } = table();
    const blade = spawn(game, "Sokenzan Spellblade");
    lands(game, "Mountain", 2);
    const inHand = hand(game).length;
    activate(game, blade);
    expect(pt(game, blade)).toEqual({ power: 2 + inHand, toughness: 3 });
  });
});

describe("Presence of the Wise", () => {
  it("gains 2 life for each card in hand", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const spell = toHand(game, "Presence of the Wise");
    const after = hand(game).length - 1;
    cast(game, spell);
    expect(life(game)).toBe(20 + 2 * after);
  });
});

describe("Fiddlehead Kami", () => {
  it("regenerates when you cast an Arcane spell", () => {
    const { game } = table();
    const kami = spawn(game, "Fiddlehead Kami");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "First Volley"), { targets: [ref(bears)] });
    destroy(game, kami);
    expect(zone(game, kami)).toBe("battlefield");
  });
});

describe("Raving Oni-Slave", () => {
  it("costs 3 life entering and 3 leaving without a Demon", () => {
    const { game } = table();
    const oni = enter(game, "Raving Oni-Slave");
    expect(life(game)).toBe(17);
    destroy(game, oni);
    expect(life(game)).toBe(14);
  });

  it("costs nothing while you control a Demon", () => {
    const { game } = table();
    spawn(game, "Abhorrent Overlord");
    const oni = enter(game, "Raving Oni-Slave");
    destroy(game, oni);
    expect(life(game)).toBe(20);
  });
});

describe("Sakiko, Mother of Summer", () => {
  it("adds that much {G} for combat damage, kept through the phases of the turn", () => {
    const { game, a } = table();
    spawn(game, "Sakiko, Mother of Summer");
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(18);
    const green = game.state.players[A].manaPool.filter((u) => u.type === "G");
    expect(green).toHaveLength(2);
  });
});

describe("Sosuke's Summons", () => {
  it("makes two Snakes, and returns from the graveyard when a nontoken Snake enters", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const summons = toHand(game, "Sosuke's Summons");
    cast(game, summons);
    expect(tokensNamed(game, "Snake Token", A)).toBe(2);
    expect(zone(game, summons)).toBe("graveyard");
    pickModes(a, 0);
    enter(game, "Sakiko, Mother of Summer");
    expect(zone(game, summons)).toBe("hand");
  });
});

describe("Teardrop Kami", () => {
  it("may tap target creature as it's sacrificed", () => {
    const { game, a } = table();
    const kami = spawn(game, "Teardrop Kami");
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    activate(game, kami, 0, { targets: [ref(bears)] });
    expect(zone(game, kami)).toBe("graveyard");
    expect(game.state.objects[bears].tapped).toBe(true);
  });
});

describe("Soratami Mindsweeper", () => {
  it("returns a land to pay, and the target player mills two", () => {
    const { game, a } = table();
    const sweeper = spawn(game, "Soratami Mindsweeper");
    const [first] = lands(game, "Island", 3);
    pickPermanents(a, first);
    const before = game.state.zones.perPlayer[B].library.length;
    activate(game, sweeper, 0, { targets: [ref(B)] });
    expect(zone(game, first)).toBe("hand");
    expect(game.state.zones.perPlayer[B].library.length).toBe(before - 2);
    expect(graveyard(game, B)).toHaveLength(2);
  });
});

describe("Yomiji, Who Bars the Way", () => {
  it("returns another legendary permanent put into a graveyard to its owner's hand", () => {
    const { game } = table();
    spawn(game, "Yomiji, Who Bars the Way");
    const sakiko = spawn(game, "Sakiko, Mother of Summer", B);
    destroy(game, sakiko, A);
    expect(zone(game, sakiko)).toBe("hand");
    expect(game.state.objects[sakiko].owner).toBe(B);
  });

  it("doesn't return itself", () => {
    const { game } = table();
    const yomiji = spawn(game, "Yomiji, Who Bars the Way");
    destroy(game, yomiji);
    expect(zone(game, yomiji)).toBe("graveyard");
  });
});

describe("Lifespinner", () => {
  it("sacrifices three Spirits, itself among them, to put a legendary Spirit onto the battlefield", () => {
    const { game, a } = table();
    const spinner = spawn(game, "Lifespinner");
    const others = [spawn(game, "Child of Thorns"), spawn(game, "Child of Thorns")];
    toLibrary(game, "Child of Thorns");
    const yomiji = toLibrary(game, "Yomiji, Who Bars the Way");
    const seen = pickFromZone(a, yomiji);
    activate(game, spinner);
    expect([spinner, ...others].every((id) => zone(game, id) === "graveyard")).toBe(true);
    expect(seen.offered).toEqual([yomiji]);
    expect(zone(game, yomiji)).toBe("battlefield");
  });
});

describe("Genju of the Cedars", () => {
  it("animates the enchanted Forest, and may return to hand when the Forest goes to the graveyard", () => {
    const { game, a } = table();
    const forest = spawn(game, "Forest");
    lands(game, "Forest", 3);
    const genju = toHand(game, "Genju of the Cedars");
    cast(game, genju, { targets: [ref(forest)] });
    expect(game.state.objects[genju].attachedTo).toBe(forest);
    activate(game, genju);
    expect(pt(game, forest)).toEqual({ power: 4, toughness: 4 });
    expect(types(game, forest)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(subtypes(game, forest)).toEqual(expect.arrayContaining(["Forest", "Spirit"]));
    pickModes(a, 0);
    destroy(game, forest);
    expect(zone(game, forest)).toBe("graveyard");
    expect(zone(game, genju)).toBe("hand");
  });
});

describe("Ire of Kaminari", () => {
  it("deals damage equal to the Arcane cards in your graveyard", () => {
    const { game } = table();
    toGraveyard(game, "First Volley");
    toGraveyard(game, "Ire of Kaminari");
    toGraveyard(game, "Grizzly Bears");
    toGraveyard(game, "First Volley", B);
    lands(game, "Mountain", 4);
    cast(game, toHand(game, "Ire of Kaminari"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
  });
});

describe("First Volley", () => {
  it("deals 1 to the creature and 1 to its controller", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 2);
    pickTargets(a, bears);
    cast(game, toHand(game, "First Volley"), { targets: [ref(bears)] });
    expect(game.state.objects[bears].damageMarked).toBe(1);
    expect(life(game, B)).toBe(19);
  });
});
