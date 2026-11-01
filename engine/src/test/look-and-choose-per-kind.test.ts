/**
 * One choice over looked-at cards, a card per category: slots for a type or a
 * mana value, read from the game or fixed (`together`), a choice from another
 * player's graveyard (`from`), a mana value cap, and each chosen card going by
 * what it is (`split`).
 */

import { describe, expect, it } from "vitest";

import { largestOneEach } from "../zone-choice-together.js";
import { asObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  hand,
  lands,
  pickFromZone,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

/** A library with these on top, the first on the very top. */
const stack = (game: ReturnType<typeof table>["game"], names: readonly string[]) => {
  const ids = names.map((name) => toLibrary(game, name));
  const library = game.state.zones.perPlayer[A].library;
  library.splice(0, library.length, ...ids, ...library.filter((id) => !ids.includes(id)));
  return ids;
};

describe("Zimone's Experiment: each chosen card goes by what it is", () => {
  it("a land enters tapped and a creature goes to hand, the rest to the bottom", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const [bear, forest, sol, wastes, island] = stack(game, [
      "Grizzly Bears",
      "Forest",
      "Sol Ring",
      "Wastes",
      "Island",
    ]);
    const seen = pickFromZone(a, bear, forest);
    cast(game, toHand(game, "Zimone's Experiment"));
    expect(seen.offered).toEqual([bear, forest, wastes, island]);
    expect(zone(game, bear)).toBe("hand");
    expect(zone(game, forest)).toBe("battlefield");
    expect(game.state.objects[forest].tapped).toBe(true);
    expect(game.state.zones.perPlayer[A].library.slice(-3).sort()).toEqual([island, sol, wastes].sort());
  });

  it("a land creature is put onto the battlefield: the land instruction comes first", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const [arbor] = stack(game, ["Dryad Arbor", "Wastes", "Wastes", "Wastes", "Wastes"]);
    pickFromZone(a, arbor);
    cast(game, toHand(game, "Zimone's Experiment"));
    expect(zone(game, arbor)).toBe("battlefield");
    expect(game.state.objects[arbor].tapped).toBe(true);
  });

  it("taking nothing still bottoms all five", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const five = stack(game, ["Grizzly Bears", "Forest", "Sol Ring", "Wastes", "Island"]);
    pickFromZone(a);
    cast(game, toHand(game, "Zimone's Experiment"));
    expect(game.state.zones.perPlayer[A].library.slice(-5).sort()).toEqual([...five].sort());
  });
});

describe("Grime Gorger: up to one card of each type from defending player's graveyard", () => {
  it("offers only that player's graveyard, one a type, and counts what was exiled", () => {
    const { game, a } = table();
    const gorger = spawn(game, "Grime Gorger");
    const bear = toGraveyard(game, "Grizzly Bears", B);
    const bear2 = toGraveyard(game, "Grizzly Bears", B);
    const ring = toGraveyard(game, "Sol Ring", B);
    const mine = toGraveyard(game, "Grizzly Bears", A);
    const seen = pickFromZone(a, bear, ring);
    attack(game, a, [gorger], B);
    game.advanceUntil((s) => s.turn.step === "declare-blockers" || zone(game, ring) === "exile");
    expect(seen.offered).toContain(bear);
    expect(seen.offered).toContain(bear2);
    expect(seen.offered).not.toContain(mine);
    expect(zone(game, bear)).toBe("exile");
    expect(zone(game, ring)).toBe("exile");
    expect(zone(game, bear2)).toBe("graveyard");
    expect(counters(game, gorger)).toBe(2);
  });

  it("refuses two cards of one type alone", () => {
    const { game, a } = table();
    const gorger = spawn(game, "Grime Gorger");
    const bear = toGraveyard(game, "Grizzly Bears", B);
    const bear2 = toGraveyard(game, "Grizzly Bears", B);
    let asked = false;
    a.chooseFromZoneFn = () => {
      asked = true;
      expect(game.canDispatch({ type: "choose-from-zone", player: A, chosen: [bear, bear2] })).not.toBeNull();
      expect(game.canDispatch({ type: "choose-from-zone", player: A, chosen: [bear] })).toBeNull();
      return [bear];
    };
    attack(game, a, [gorger], B);
    game.advanceUntil(() => asked);
    expect(asked).toBe(true);
  });
});

describe("Hurkyl, Master Wizard: the slots are the types among noncreature spells cast", () => {
  const endStep = (game: ReturnType<typeof table>["game"]): void => {
    toStep(game, "end");
    settle(game);
  };

  it("offers only cards of the types cast, one a type", () => {
    const { game, a } = table();
    spawn(game, "Hurkyl, Master Wizard");
    lands(game, "Island", 3);
    pickFromZone(a);
    cast(game, toHand(game, "Sol Ring"));
    const [ring, bear, opt, island, wastes] = stack(game, ["Mind Stone", "Grizzly Bears", "Opt", "Island", "Wastes"]);
    const seen = pickFromZone(a, ring);
    endStep(game);
    expect(seen.offered).toEqual([ring]);
    expect(zone(game, ring)).toBe("hand");
    expect(game.state.zones.perPlayer[A].library.slice(-4).sort()).toEqual([bear, island, opt, wastes].sort());
  });

  it("does nothing without a noncreature spell (the intervening if)", () => {
    const { game, a } = table();
    spawn(game, "Hurkyl, Master Wizard");
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    let asked = false;
    a.chooseFromZoneFn = () => {
      asked = true;
      return [];
    };
    endStep(game);
    expect(asked).toBe(false);
  });
});

describe("Queen Kayla bin-Kroog: one of each mana value 1, 2 and 3 among the discarded", () => {
  it("returns one card a mana value together, only artifact or creature cards", () => {
    const { game, a } = table();
    spawn(game, "Queen Kayla bin-Kroog");
    lands(game, "Wastes", 4);
    const one = toHand(game, "Sol Ring");
    const two = toHand(game, "Grizzly Bears");
    const two2 = toHand(game, "Mind Stone");
    const four = toHand(game, "Serra Angel");
    const opt = toHand(game, "Opt");
    const before = toGraveyard(game, "Grizzly Bears");
    const held = hand(game).length;
    const seen = pickFromZone(a, one, two);
    const kayla = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Queen Kayla bin-Kroog");
    activate(game, kayla!, 0);
    settle(game);
    expect(seen.offered).toContain(one);
    expect(seen.offered).toContain(two);
    expect(seen.offered).toContain(two2);
    expect(seen.offered).not.toContain(four);
    expect(seen.offered).not.toContain(opt);
    expect(seen.offered).not.toContain(before);
    expect(zone(game, one)).toBe("battlefield");
    expect(zone(game, two)).toBe("battlefield");
    expect(zone(game, two2)).toBe("graveyard");
    expect(hand(game).length).toBe(held);
  });

  it("finds a discarded card a replacement exiled instead (the ruling)", () => {
    const { game, a } = table();
    spawn(game, "Queen Kayla bin-Kroog");
    spawn(game, "Rest in Peace", B);
    lands(game, "Wastes", 4);
    const ring = toHand(game, "Sol Ring");
    pickFromZone(a, ring);
    const kayla = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === "Queen Kayla bin-Kroog");
    activate(game, kayla!, 0);
    settle(game);
    expect(zone(game, ring)).toBe("battlefield");
  });
});

describe("Smelting Vat: a total mana value cap read as it resolves", () => {
  it("takes up to two noncreature artifacts within the sacrificed artifact's mana value", () => {
    const { game, a } = table();
    const vat = spawn(game, "Smelting Vat");
    const fodder = spawn(game, "Mind Stone");
    lands(game, "Wastes", 1);
    const [ring, sol, big, wurm] = stack(game, [
      "Mana Vault",
      "Sol Ring",
      "Serum Tank",
      "Grizzly Bears",
      "Wastes",
      "Wastes",
      "Wastes",
      "Wastes",
    ]);
    const seen = pickFromZone(a, ring, sol);
    game.dispatch({ type: "activate-ability", player: A, source: vat, abilityIndex: 0, targets: [], sacrifice: fodder });
    settle(game);
    expect(seen.offered).toContain(ring);
    expect(seen.offered).toContain(sol);
    expect(seen.offered).not.toContain(wurm);
    expect(seen.offered).not.toContain(big);
    expect(zone(game, ring)).toBe("battlefield");
    expect(zone(game, sol)).toBe("battlefield");
    expect(zone(game, big)).toBe("library");
  });
});

describe("Michelangelo, Improviser: a creature card and/or a land card from your hand, together", () => {
  it("puts one of each onto the battlefield in one move", () => {
    const { game, a } = table();
    const mikey = spawn(game, "Michelangelo, Improviser");
    const bear = toHand(game, "Grizzly Bears");
    const forest = toHand(game, "Forest");
    const opt = toHand(game, "Opt");
    const seen = pickFromZone(a, bear, forest);
    attack(game, a, [mikey], B);
    game.advanceUntil(() => zone(game, bear) === "battlefield");
    expect(seen.offered).not.toContain(opt);
    expect(zone(game, forest)).toBe("battlefield");
    expect(zone(game, opt)).toBe("hand");
  });

  it("with two creatures in hand, only one may go", () => {
    const { game, a } = table();
    const mikey = spawn(game, "Michelangelo, Improviser");
    const bear = toHand(game, "Grizzly Bears");
    const bear2 = toHand(game, "Grizzly Bears");
    let asked = false;
    a.chooseFromZoneFn = () => {
      asked = true;
      expect(game.canDispatch({ type: "choose-from-zone", player: A, chosen: [bear, bear2] })).not.toBeNull();
      return [bear];
    };
    attack(game, a, [mikey], B);
    game.advanceUntil(() => asked);
    expect(asked).toBe(true);
  });
});

describe("the largest set a card a slot can make", () => {
  it("counts a matching, not the cards", () => {
    const together = {
      rule: "one-each" as const,
      text: "",
      tags: { a: ["0"], b: ["0"], c: ["0", "1"], d: ["2"] },
    };
    expect(largestOneEach(together, ["a", "b"].map(asObjectId))).toBe(1);
    expect(largestOneEach(together, ["a", "c"].map(asObjectId))).toBe(2);
    expect(largestOneEach(together, ["a", "b", "c", "d"].map(asObjectId))).toBe(3);
  });
});
