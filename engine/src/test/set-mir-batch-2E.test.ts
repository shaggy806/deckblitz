import { describe, expect, it } from "vitest";
import {
  A,
  B,
  attack,
  cast,
  controller,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pickModes,
  ref,
  spawn,
  toHand,
  zone,
  table,
} from "./harness.js";

describe("Mirage batch 2, group E", () => {
  it("Reign of Terror destroys the chosen colour only and costs 2 life per creature that died", () => {
    const { game, a } = table();
    const myLions = spawn(game, "Savannah Lions", A);
    const theirLions1 = spawn(game, "Savannah Lions", B);
    const theirLions2 = spawn(game, "Savannah Lions", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 5);
    pickModes(a, 1);
    cast(game, toHand(game, "Reign of Terror"));
    expect(zone(game, myLions)).toBe("graveyard");
    expect(zone(game, theirLions1)).toBe("graveyard");
    expect(zone(game, theirLions2)).toBe("graveyard");
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game, A)).toBe(14);
  });

  it("Malignant Growth makes an opponent draw one extra card per growth counter and deals that much", () => {
    const { game } = table();
    const growth = spawn(game, "Malignant Growth", A);
    game.state.objects[growth].counters.growth = 2;
    const before = hand(game, B).length;
    nextTurn(game);
    expect(hand(game, B).length).toBe(before + 3);
    expect(life(game, B)).toBe(18);
  });

  it("Emberwilde Djinn changes hands when the upkeep player pays 2 life", () => {
    const { game, b } = table();
    const djinn = spawn(game, "Emberwilde Djinn", A);
    // Offered only what Bob can pay: with two Mountains, both ways.
    lands(game, "Mountain", 2, B);
    const asked: string[][] = [];
    b.chooseModesFn = (_view, _min, _max, texts) => {
      asked.push([...texts]);
      const i = texts.findIndex((t) => /2 life/.test(t));
      return [i >= 0 ? i : 0];
    };
    nextTurn(game);
    expect(asked.flat().join("|")).toMatch(/Pay \{R\}\{R\}.*Pay 2 life|Pay 2 life.*Pay \{R\}\{R\}/);
    expect(controller(game, djinn)).toBe(B);
    expect(life(game, B)).toBe(18);
  });

  it("Barbed Foliage strips flanking and pings a non-flier attacking its controller", () => {
    const { game, a } = table();
    spawn(game, "Barbed Foliage", B);
    const cavalry = spawn(game, "Benalish Cavalry", A);
    const drake = spawn(game, "Wind Drake", A);
    attack(game, a, [cavalry, drake]);
    expect(keywords(game, cavalry).has("flanking")).toBe(false);
    expect(game.state.objects[cavalry].damageMarked).toBe(1);
    expect(game.state.objects[drake].damageMarked).toBe(0);
  });

  it("Soul Rend spares a nonwhite creature but still draws at the next upkeep", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Soul Rend"), { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    const before = hand(game, B).length;
    nextTurn(game);
    // Bob's normal draw plus nothing: the delayed draw is Alice's.
    expect(hand(game, B).length).toBe(before + 1);
    const lions = spawn(game, "Savannah Lions", A);
    lands(game, "Swamp", 2, B);
    cast(game, toHand(game, "Soul Rend", B), { player: B, targets: [ref(lions)] });
    expect(zone(game, lions)).toBe("graveyard");
  });

  it("Soul Rend's caster draws at the beginning of the next turn's upkeep", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Swamp", 2);
    cast(game, toHand(game, "Soul Rend"), { targets: [ref(bears)] });
    const before = hand(game, A).length;
    nextTurn(game);
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("Energy Bolt's second mode gains X life", () => {
    const { game } = table();
    lands(game, "Plateau", 5);
    cast(game, toHand(game, "Energy Bolt"), { x: 3, modes: [1], targets: [ref(B)] });
    expect(life(game, B)).toBe(23);
  });
});
