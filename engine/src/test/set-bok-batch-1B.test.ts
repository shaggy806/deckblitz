/**
 * Saviors of Kamigawa's rest and Betrayers of Kamigawa (SOK, BOK; B202),
 * group B. One test per card whose behaviour is more than a stat line, on
 * the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  cast,
  controller,
  hand,
  lands,
  life,
  pickPermanents,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
  activate,
} from "./harness.js";

describe("Plow Through Reito", () => {
  it("gives the target +1/+1 for each Plains returned", () => {
    const { game, a } = table();
    const plains = lands(game, "Plains", 3);
    const bears = spawn(game, "Grizzly Bears");
    pickPermanents(a, ...plains);
    cast(game, toHand(game, "Plow Through Reito"), { targets: [ref(bears)] });
    expect(plains.every((p) => zone(game, p) === "hand")).toBe(true);
    expect(pt(game, bears)).toEqual({ power: 5, toughness: 5 });
  });
});

describe("Kami of the Tended Garden", () => {
  it("is sacrificed at upkeep when {G} can't be paid", () => {
    const { game } = table();
    const kami = spawn(game, "Kami of the Tended Garden");
    toStep(game, "upkeep");
    settle(game);
    expect(zone(game, kami)).toBe("graveyard");
  });
});

describe("Oyobi, Who Split the Heavens", () => {
  it("makes a 3/3 flying Spirit when you cast an Arcane spell (Ribbons then counts it)", () => {
    const { game } = table();
    spawn(game, "Oyobi, Who Split the Heavens");
    lands(game, "Island", 5);
    const ribbons = toHand(game, "Ribbons of the Reikai");
    const before = hand(game).length;
    cast(game, ribbons);
    expect(tokensNamed(game, "Spirit Token (White 3/3 Flying)", A)).toBe(1);
    // Oyobi and the token: two Spirits, two cards.
    expect(hand(game).length).toBe(before - 1 + 2);
  });
});

describe("Terashi's Grasp", () => {
  it("gains life equal to the mana value even when the artifact survives", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    const ingot = spawn(game, "Darksteel Ingot", B);
    cast(game, toHand(game, "Terashi's Grasp"), { targets: [ref(ingot)] });
    expect(zone(game, ingot)).toBe("battlefield");
    expect(life(game)).toBe(23);
  });
});

describe("Floodbringer", () => {
  it("returns a land you control to pay, and taps the target land", () => {
    const { game, a } = table();
    const flood = spawn(game, "Floodbringer");
    lands(game, "Island", 2);
    const forest = spawn(game, "Forest");
    const theirs = spawn(game, "Forest", B);
    pickPermanents(a, forest);
    activate(game, flood, 0, { targets: [ref(theirs)] });
    expect(zone(game, forest)).toBe("hand");
    expect(game.state.objects[theirs].tapped).toBe(true);
  });
});

describe("Mark of the Oni", () => {
  it("steals the creature, and is sacrificed at the end step with no Demon", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const bears = spawn(game, "Grizzly Bears", B);
    const mark = toHand(game, "Mark of the Oni");
    cast(game, mark, { targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(A);
    toStep(game, "end");
    settle(game);
    expect(zone(game, mark)).toBe("graveyard");
    expect(controller(game, bears)).toBe(B);
  });

  it("stays while you control a Demon", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    spawn(game, "Abhorrent Overlord");
    const bears = spawn(game, "Grizzly Bears", B);
    const mark = toHand(game, "Mark of the Oni");
    cast(game, mark, { targets: [ref(bears)] });
    toStep(game, "end");
    settle(game);
    expect(zone(game, mark)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
  });
});

describe("Enshrined Memories", () => {
  it("puts every creature card among the top X into your hand", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const bear1 = toLibrary(game, "Grizzly Bears");
    const island = toLibrary(game, "Island");
    const bear2 = toLibrary(game, "Grizzly Bears");
    cast(game, toHand(game, "Enshrined Memories"), { x: 3 });
    expect(zone(game, bear1)).toBe("hand");
    expect(zone(game, bear2)).toBe("hand");
    expect(zone(game, island)).toBe("library");
    const library = game.state.zones.perPlayer[A].library;
    expect(library.indexOf(island)).toBe(library.length - 1);
  });
});

describe("Threads of Disloyalty", () => {
  it("steals a creature with mana value 2 or less, and can't target a bigger one", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const giant = spawn(game, "Hill Giant", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const threads = toHand(game, "Threads of Disloyalty");
    expect(() => cast(game, threads, { targets: [ref(giant)] })).toThrow();
    cast(game, threads, { targets: [ref(bears)] });
    expect(controller(game, bears)).toBe(A);
  });
});
