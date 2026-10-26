import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  cast,
  destroy,
  enter,
  hand,
  lands,
  life,
  nextTurn,
  pickModes,
  pickPermanents,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Visions batch 1, group C", () => {
  it("Dormant Volcano stays when an untapped Mountain is returned", () => {
    const { game, a } = table();
    const mountain = spawn(game, "Mountain", A);
    pickPermanents(a, mountain);
    const volcano = enter(game, "Dormant Volcano", A);
    expect(zone(game, volcano)).toBe("battlefield");
    expect(game.state.objects[volcano].tapped).toBe(true);
    expect(hand(game, A)).toContain(mountain);
  });

  it("Dormant Volcano is sacrificed with only a tapped Mountain", () => {
    const { game, a } = table();
    const mountain = spawn(game, "Mountain", A, { tapped: true });
    const seen = pickPermanents(a);
    const volcano = enter(game, "Dormant Volcano", A);
    expect(seen.offered).not.toContain(mountain);
    expect(zone(game, volcano)).toBe("graveyard");
    expect(zone(game, mountain)).toBe("battlefield");
  });

  it("Ovinomancer is sacrificed without three basic lands, and none are returned", () => {
    const { game } = table();
    const islands = lands(game, "Island", 2);
    const ovino = enter(game, "Ovinomancer", A);
    expect(zone(game, ovino)).toBe("graveyard");
    for (const id of islands) expect(zone(game, id)).toBe("battlefield");
  });

  it("Ovinomancer stays for three basic lands, then turns a creature into a Sheep", () => {
    const { game, a } = table();
    const islands = lands(game, "Island", 3);
    pickModes(a, 0);
    pickPermanents(a, ...islands);
    const ovino = enter(game, "Ovinomancer", A);
    expect(zone(game, ovino)).toBe("battlefield");
    for (const id of islands) expect(zone(game, id)).toBe("hand");
    const wurm = spawn(game, "Craw Wurm", B);
    activate(game, ovino, 0, { targets: [ref(wurm)] });
    expect(zone(game, wurm)).toBe("graveyard");
    expect(zone(game, ovino)).toBe("hand");
    expect(tokensNamed(game, "Green Sheep Token", B)).toBe(1);
  });

  it("Death Watch: the creature's controller loses its power, you gain its toughness", () => {
    const { game } = table();
    const wurm = spawn(game, "Craw Wurm", B); // 6/4
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "Death Watch"), { targets: [ref(wurm)] });
    destroy(game, wurm);
    expect(life(game, B)).toBe(14);
    expect(life(game, A)).toBe(24);
  });

  it("Teferi's Realm phases out the nontoken permanents of the type the upkeep's player chooses", () => {
    const { game, b } = table();
    const realm = spawn(game, "Teferi's Realm", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const land = spawn(game, "Wastes", A);
    pickModes(b, 1); // creature
    nextTurn(game, "upkeep");
    settle(game);
    expect(zone(game, bears)).toBe("phased-out");
    expect(zone(game, land)).toBe("battlefield");
    expect(zone(game, realm)).toBe("battlefield");
  });

  it("Giant Caterpillar makes its Butterfly at the next end step", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const cat = spawn(game, "Giant Caterpillar", A);
    activate(game, cat, 0);
    expect(zone(game, cat)).toBe("graveyard");
    expect(tokensNamed(game, "Butterfly Token", A)).toBe(0);
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Butterfly Token", A)).toBe(1);
  });

  it("Dragon Mask pumps a creature, then returns it at the next end step", () => {
    const { game } = table();
    lands(game, "Wastes", 3);
    const mask = spawn(game, "Dragon Mask", A);
    const bears = spawn(game, "Grizzly Bears", A);
    activate(game, mask, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    toStep(game, "end");
    settle(game);
    expect(zone(game, bears)).toBe("hand");
  });
});
