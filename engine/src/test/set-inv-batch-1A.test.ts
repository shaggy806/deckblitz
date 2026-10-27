/**
 * Invasion (INV; B226), group A. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  attack,
  cast,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickFromZone,
  pickModes,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Coalition Victory", () => {
  const board = (withGreen: boolean) => {
    const t = table();
    for (const land of ["Plains", "Island", "Swamp", "Mountain", "Forest"]) spawn(t.game, land);
    lands(t.game, "Wastes", 3);
    spawn(t.game, "Savannah Lions");
    spawn(t.game, "Coral Merfolk");
    // One black-red creature counts for both colors (the ruling).
    spawn(t.game, "Blazing Specter");
    if (withGreen) spawn(t.game, "Grizzly Bears");
    return t;
  };

  it("wins with a land of each basic type and a creature of each color", () => {
    const { game } = board(true);
    cast(game, toHand(game, "Coalition Victory"));
    expect(game.state.result.winner).toBe(A);
  });

  it("does nothing missing one color", () => {
    const { game } = board(false);
    cast(game, toHand(game, "Coalition Victory"));
    expect(game.state.result.winner ?? null).toBeNull();
  });
});

describe("Cauldron Dance", () => {
  it("can't be cast outside combat", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    lands(game, "Mountain", 3);
    const dead = toGraveyard(game, "Grizzly Bears");
    expect(() => cast(game, toHand(game, "Cauldron Dance"), { targets: [ref(dead)] })).toThrow();
  });

  it("returns the reanimated one to hand and sacrifices the one from hand at end step", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    lands(game, "Mountain", 3);
    const dead = toGraveyard(game, "Grizzly Bears");
    const held = toHand(game, "Savannah Lions");
    toStep(game, "begin-combat");
    pickFromZone(a, held);
    cast(game, toHand(game, "Cauldron Dance"), { targets: [ref(dead)] });
    const [reanimated] = named(game, "Grizzly Bears", A);
    expect(reanimated).toBeDefined();
    expect(zone(game, held)).toBe("battlefield");
    expect(keywords(game, reanimated).has("haste")).toBe(true);
    expect(keywords(game, held).has("haste")).toBe(true);
    nextTurn(game);
    expect(named(game, "Grizzly Bears", A)).toHaveLength(0);
    expect(hand(game).some((id) => game.state.objects[id].cardName === "Grizzly Bears")).toBe(true);
    expect(named(game, "Savannah Lions", A)).toHaveLength(0);
    expect(game.state.zones.perPlayer[A].graveyard.some((id) => game.state.objects[id].cardName === "Savannah Lions")).toBe(
      true,
    );
  });
});

describe("Rith, the Awakener", () => {
  it("makes a Saproling for each permanent of the chosen color, whoever controls it", () => {
    const { game, a } = table();
    const rith = spawn(game, "Rith, the Awakener");
    lands(game, "Forest", 3);
    spawn(game, "Savannah Lions", A);
    spawn(game, "Savannah Lions", B);
    spawn(game, "Grizzly Bears", B);
    // Yes to the payment, then White (mode 0): two Lions and Rith itself.
    pickModes(a, 0);
    attack(game, a, [rith]);
    expect(life(game, B)).toBe(14);
    expect(tokensNamed(game, "Saproling Token", A)).toBe(3);
  });
});

describe("Vile Consumption", () => {
  it("each creature's controller pays 1 life on their upkeep or sacrifices it", () => {
    const { game, b } = table();
    spawn(game, "Vile Consumption");
    spawn(game, "Grizzly Bears", A);
    spawn(game, "Grizzly Bears", B);
    pickModes(b, 0);
    nextTurn(game); // bob's turn: he pays
    expect(named(game, "Grizzly Bears", B)).toHaveLength(1);
    expect(life(game, B)).toBe(19);
    expect(named(game, "Grizzly Bears", A)).toHaveLength(1);
    nextTurn(game); // alice's: she declines
    expect(named(game, "Grizzly Bears", A)).toHaveLength(0);
  });
});

describe("Canopy Surge", () => {
  it("kicked, deals 4 to each flier and each player", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const drake = spawn(game, "Wind Drake", B);
    const angel = spawn(game, "Serra Angel", B);
    const bears = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Canopy Surge"), { kicked: true });
    expect(zone(game, drake)).toBe("graveyard");
    expect(zone(game, angel)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game, A)).toBe(16);
    expect(life(game, B)).toBe(16);
  });
});

describe("Crusading Knight", () => {
  it("gets +1/+1 for each Swamp opponents control, not yours", () => {
    const { game } = table();
    const knight = spawn(game, "Crusading Knight");
    spawn(game, "Swamp", A);
    lands(game, "Swamp", 2, B);
    expect(pt(game, knight)).toEqual({ power: 4, toughness: 4 });
  });
});

describe("Scouting Trek", () => {
  it("puts the basic lands found on top of the library", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const forest = toLibrary(game, "Forest");
    const island = toLibrary(game, "Island");
    pickFromZone(a, forest, island);
    cast(game, toHand(game, "Scouting Trek"));
    const library = game.state.zones.perPlayer[A].library;
    const top = library.slice(0, 2);
    expect(new Set(top)).toEqual(new Set([forest, island]));
  });
});

describe("Dredge", () => {
  it("sacrifices a creature or land, then draws", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    const before = hand(game).length;
    cast(game, toHand(game, "Dredge"));
    expect(named(game, "Swamp", A)).toHaveLength(0);
    expect(hand(game).length).toBe(before + 1);
  });
});
