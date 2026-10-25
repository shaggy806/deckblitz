/**
 * Homelands, batch 1 group E: the clause of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  destroy,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pt,
  ref,
  spawn,
  enter,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Serrated Arrows", () => {
  it("enters with three arrowhead counters and spends one per -1/-1 counter", () => {
    const { game } = table();
    const arrows = enter(game, "Serrated Arrows");
    expect(counters(game, arrows, "arrowhead")).toBe(3);
    const bears = spawn(game, "Grizzly Bears", B);
    activate(game, arrows, 0, { targets: [ref(bears)] });
    expect(counters(game, arrows, "arrowhead")).toBe(2);
    expect(counters(game, bears, "-1/-1")).toBe(1);
    expect(pt(game, bears)).toEqual({ power: 1, toughness: 1 });
  });

  it("is sacrificed at your upkeep only once it has no arrowhead counters", () => {
    const { game } = table();
    const arrows = enter(game, "Serrated Arrows");
    toStep(game, "draw");
    expect(zone(game, arrows)).toBe("battlefield");
    game.state.objects[arrows].counters.arrowhead = 0;
    toStep(game, "draw");
    expect(zone(game, arrows)).toBe("graveyard");
  });
});

describe("Feroz's Ban", () => {
  it("makes creature spells cost {2} more", () => {
    const { game } = table();
    spawn(game, "Feroz's Ban", B);
    lands(game, "Forest", 3);
    const bears = toHand(game, "Grizzly Bears");
    expect(() => cast(game, bears)).toThrow();
    lands(game, "Forest", 1);
    cast(game, bears);
    expect(zone(game, bears)).toBe("battlefield");
  });
});

describe("An-Zerrin Ruins", () => {
  it("keeps creatures of the chosen type tapped in their controllers' untap steps", () => {
    const { game } = table();
    const ruins = spawn(game, "An-Zerrin Ruins");
    game.state.objects[ruins].chosenCreatureType = "Bear";
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    const lions = spawn(game, "Savannah Lions", B, { tapped: true });
    nextTurn(game);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.objects[lions].tapped).toBe(false);
  });
});

describe("Reef Pirates", () => {
  it("mills a card from the opponent it damages", () => {
    const { game, a } = table();
    const pirates = spawn(game, "Reef Pirates");
    const before = game.state.zones.perPlayer[B].graveyard.length;
    attack(game, a, [pirates]);
    expect(life(game, B)).toBe(18);
    expect(game.state.zones.perPlayer[B].graveyard.length).toBe(before + 1);
  });
});

describe("Drudge Spell", () => {
  it("exiles two creature cards for a regenerating Skeleton, and its leaving destroys every Skeleton token past regeneration", () => {
    const { game } = table();
    const spell = spawn(game, "Drudge Spell");
    const corpses = [toGraveyard(game, "Grizzly Bears"), toGraveyard(game, "Savannah Lions")];
    lands(game, "Swamp", 2);
    activate(game, spell, 0);
    expect(corpses.map((id) => zone(game, id))).toEqual(["exile", "exile"]);
    expect(tokensNamed(game, "Skeleton Regenerating Token", A)).toBe(1);
    const skeleton = named(game, "Skeleton Regenerating Token")[0];
    spawn(game, "Skeleton Token", B);
    // A regeneration shield doesn't save it: "They can't be regenerated."
    activate(game, skeleton, 0);
    destroy(game, spell);
    expect(tokensNamed(game, "Skeleton Regenerating Token")).toBe(0);
    expect(tokensNamed(game, "Skeleton Token")).toBe(0);
  });
});

describe("Veldrane of Sengir", () => {
  it("gets -3/-0 and gains forestwalk", () => {
    const { game } = table();
    const veldrane = spawn(game, "Veldrane of Sengir");
    lands(game, "Swamp", 3);
    activate(game, veldrane);
    expect(pt(game, veldrane)).toEqual({ power: 2, toughness: 5 });
    expect(keywords(game, veldrane).has("forestwalk")).toBe(true);
  });
});

describe("Renewal", () => {
  it("sacrifices a land, fetches a basic, and draws at the next upkeep", () => {
    const { game, a } = table();
    const [fodder] = lands(game, "Forest", 4);
    const forest = toLibrary(game, "Forest");
    a.chooseFromZoneFn = (_view, eligible) => eligible.slice(0, 1);
    const handBefore = hand(game).length;
    cast(game, toHand(game, "Renewal"), { sacrifice: fodder });
    expect(zone(game, fodder)).toBe("graveyard");
    expect(zone(game, forest)).toBe("battlefield");
    expect(hand(game).length).toBe(handBefore);
    nextTurn(game, "draw");
    // Alice draws at Bob's upkeep.
    expect(hand(game).length).toBe(handBefore + 1);
  });
});

describe("Winter Sky", () => {
  it("either deals 1 to each creature and player or has each player draw", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    const handB = hand(game, B).length;
    cast(game, toHand(game, "Winter Sky"));
    if (life(game, B) === 19) {
      expect(life(game, A)).toBe(19);
      expect(game.state.objects[bears].damageMarked).toBe(1);
      expect(hand(game, B).length).toBe(handB);
    } else {
      expect(life(game, A)).toBe(20);
      expect(hand(game, B).length).toBe(handB + 1);
    }
  });
});
