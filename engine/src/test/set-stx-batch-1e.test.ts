/**
 * Strixhaven: School of Mages, batch 1, group e — the clause of each card most
 * likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  C,
  activate,
  cast,
  controller,
  counters,
  destroy,
  graveyard,
  hand,
  life,
  lands,
  nextTurn,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  watchTargets,
  zone,
} from "./harness.js";

describe("Show of Confidence", () => {
  it("cast alone, it's one counter: the spell itself isn't one of the others", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    cast(game, toHand(game, "Show of Confidence"), { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(1);
  });

  it("copies itself once for each other instant or sorcery cast this turn", () => {
    const { game, a } = table();
    lands(game, "Mountain", 2);
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(B)] });
    pickTargets(a, bears);
    cast(game, toHand(game, "Show of Confidence"), { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(3);
  });
});

describe("Containment Breach", () => {
  it("makes a Pest when the destroyed permanent's mana value is 2 or less", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const ring = spawn(game, "Sol Ring", B);
    cast(game, toHand(game, "Containment Breach"), { targets: [ref(ring)] });
    expect(zone(game, ring)).toBe("graveyard");
    expect(tokensNamed(game, "Pest Token", A)).toBe(1);
  });

  it("makes no Pest for mana value 3", () => {
    const { game } = table();
    lands(game, "Forest", 3);
    const stone = spawn(game, "Worn Powerstone", B);
    cast(game, toHand(game, "Containment Breach"), { targets: [ref(stone)] });
    expect(zone(game, stone)).toBe("graveyard");
    expect(tokensNamed(game, "Pest Token", A)).toBe(0);
  });
});

describe("Tempted by the Oriq", () => {
  it("takes one creature of mana value 3 or less from each opponent, for good", () => {
    const { game } = table({ players: 3 });
    lands(game, "Island", 4);
    const bobs = spawn(game, "Grizzly Bears", B);
    const carols = spawn(game, "Grizzly Bears", C);
    cast(game, toHand(game, "Tempted by the Oriq"), { targets: [ref(bobs), ref(carols), null] });
    expect(controller(game, bobs)).toBe(A);
    expect(controller(game, carols)).toBe(A);
    nextTurn(game);
    expect(controller(game, bobs)).toBe(A);
  });

  it("can't target a creature of mana value 4 or more", () => {
    const { game } = table();
    lands(game, "Island", 4);
    const angel = spawn(game, "Serra Angel", B);
    expect(() => cast(game, toHand(game, "Tempted by the Oriq"), { targets: [ref(angel), null, null] })).toThrow();
    expect(controller(game, angel)).toBe(B);
  });
});

describe("Culmination of Studies", () => {
  it("treasure per land, a draw per blue card, 1 damage per red card", () => {
    const { game } = table();
    lands(game, "Island", 1);
    lands(game, "Mountain", 4);
    toLibrary(game, "Opt");
    toLibrary(game, "Shock");
    toLibrary(game, "Island");
    const before = hand(game, A).length;
    cast(game, toHand(game, "Culmination of Studies"), { x: 3 });
    expect(tokensNamed(game, "Treasure Token", A)).toBe(1);
    expect(hand(game, A).length).toBe(before + 1);
    expect(life(game, B)).toBe(19);
  });
});

describe("Humiliate", () => {
  it("strips a nonland card, then puts a counter on a creature you choose", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    lands(game, "Swamp", 1);
    const bears = spawn(game, "Grizzly Bears");
    spawn(game, "Grizzly Bears");
    const bolt = toHand(game, "Lightning Bolt", B);
    a.chooseFromZoneFn = () => [bolt];
    pickPermanents(a, bears);
    cast(game, toHand(game, "Humiliate"), { targets: [ref(B)] });
    expect(zone(game, bolt)).toBe("graveyard");
    expect(counters(game, bears)).toBe(1);
  });
});

describe("Stonebinder's Familiar", () => {
  it("grows once on your turn however many exiles, never on an opponent's", () => {
    const { game } = table();
    const familiar = spawn(game, "Stonebinder's Familiar");
    const exile = (id: string): void => {
      game.debugApplyEffect(A, { kind: "exile", target: 0 }, [ref(id as never)]);
      settle(game);
    };
    exile(toGraveyard(game, "Grizzly Bears", B));
    expect(counters(game, familiar)).toBe(1);
    exile(toGraveyard(game, "Grizzly Bears", B));
    expect(counters(game, familiar)).toBe(1);
    nextTurn(game); // bob's turn
    exile(toGraveyard(game, "Grizzly Bears", B));
    expect(counters(game, familiar)).toBe(1);
  });
});

describe("Shadewing Laureate", () => {
  it("another flier of yours dying puts a counter on a target; a ground creature doesn't", () => {
    const { game, a } = table();
    const laureate = spawn(game, "Shadewing Laureate");
    const angel = spawn(game, "Serra Angel");
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, laureate);
    destroy(game, bears);
    expect(counters(game, laureate)).toBe(0);
    destroy(game, angel);
    expect(counters(game, laureate)).toBe(1);
  });
});

describe("Returned Pastcaller", () => {
  it("offers Spirit, instant and sorcery cards from your graveyard — not other creatures", () => {
    const { game, a } = table();
    const spirit = toGraveyard(game, "Accursed Spirit");
    const bolt = toGraveyard(game, "Lightning Bolt");
    const bears = toGraveyard(game, "Grizzly Bears");
    const seen = watchTargets(a, () => [spirit]);
    game.debugSpawn("Returned Pastcaller", A, "battlefield", { announceEntry: true, summoningSick: false });
    settle(game);
    expect(seen.offered[0]).toContain(spirit);
    expect(seen.offered[0]).toContain(bolt);
    expect(seen.offered[0]).not.toContain(bears);
    expect(zone(game, spirit)).toBe("hand");
  });
});

describe("Reflective Golem", () => {
  it("pays {2} to copy a spell that targets only it", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const golem = spawn(game, "Reflective Golem");
    pickModes(a, 0);
    pickTargets(a, golem);
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(golem)] });
    // 2/3, plus +3/+3 from the spell and +3/+3 from its copy.
    expect(pt(game, golem)).toEqual({ power: 8, toughness: 9 });
  });

  it("doesn't trigger for a spell that targets another creature", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    spawn(game, "Reflective Golem");
    const bears = spawn(game, "Grizzly Bears");
    let asked = 0;
    a.chooseModesFn = () => {
      asked += 1;
      return [0];
    };
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(bears)] });
    expect(asked).toBe(0);
  });
});

describe("Brackish Trudge", () => {
  it("returns from the graveyard only once you've gained life this turn", () => {
    const { game } = table();
    lands(game, "Swamp", 2);
    const trudge = toGraveyard(game, "Brackish Trudge");
    expect(() => activate(game, trudge)).toThrow();
    game.debugApplyEffect(A, { kind: "gain-life", amount: 1 }, []);
    activate(game, trudge);
    expect(zone(game, trudge)).toBe("hand");
    expect(graveyard(game, A)).not.toContain(trudge);
  });
});
