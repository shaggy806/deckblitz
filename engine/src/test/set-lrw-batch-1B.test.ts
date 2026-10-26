/**
 * Lorwyn (LRW; B189), group B. One test per card whose behaviour is more
 * than a stat line, on the clause most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickModes,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

describe("Brion Stoutarm", () => {
  it("deals the sacrificed creature's power to a player, with lifelink", () => {
    const { game } = table();
    const brion = spawn(game, "Brion Stoutarm");
    const giant = spawn(game, "Hill Giant");
    lands(game, "Mountain", 1);
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: brion,
      abilityIndex: 0,
      targets: [ref(B)],
      sacrifice: giant,
    } as Action);
    settle(game);
    expect(zone(game, giant)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
    expect(life(game, A)).toBe(23);
  });
});

describe("Hoofprints of the Stag", () => {
  it("gets a counter per card drawn and spends four on a 4/4 flier", () => {
    const { game, a } = table();
    const hoof = spawn(game, "Hoofprints of the Stag");
    game.state.objects[hoof].counters.hoofprint = 2;
    lands(game, "Island", 3);
    lands(game, "Plains", 3);
    pickModes(a, 0);
    cast(game, toHand(game, "Divination"));
    expect(counters(game, hoof, "hoofprint")).toBe(4);
    activate(game, hoof, 0);
    expect(counters(game, hoof, "hoofprint")).toBe(0);
    const [token] = named(game, "Elemental Token (4/4 White Flying)");
    expect(pt(game, token)).toEqual({ power: 4, toughness: 4 });
    expect(keywords(game, token).has("flying")).toBe(true);
  });
});

describe("Footbottom Feast", () => {
  it("puts the targeted creature cards on top, then draws the last one put there", () => {
    const { game } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    const giant = toGraveyard(game, "Hill Giant");
    lands(game, "Swamp", 3);
    const before = hand(game).length;
    cast(game, toHand(game, "Footbottom Feast"), { targets: [ref(bears), ref(giant)] });
    // The hand gained the Feast's draw (the Feast itself left it).
    expect(hand(game).length).toBe(before + 1);
    expect(hand(game)).toContain(giant);
    expect(zone(game, bears)).toBe("library");
  });

  it("still draws when cast with no targets", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const before = hand(game).length;
    cast(game, toHand(game, "Footbottom Feast"), { targets: [] });
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Lys Alana Scarblade", () => {
  it("discards an Elf card to give -X/-X, X the Elves you control", () => {
    const { game, a } = table();
    const blade = spawn(game, "Lys Alana Scarblade");
    spawn(game, "Llanowar Elves");
    const target = spawn(game, "Hill Giant", B);
    const elf = toHand(game, "Llanowar Elves");
    toHand(game, "Grizzly Bears");
    a.chooseDiscardsFn = (cards, n) =>
      cards
        .filter((c) => c.id === elf)
        .map((c) => c.id)
        .slice(0, n);
    pickTargets(a, target);
    activate(game, blade, 0, { targets: [ref(target)] });
    expect(graveyard(game)).toContain(elf);
    expect(pt(game, target)).toEqual({ power: 1, toughness: 1 });
  });
});

describe("Stinkdrinker Daredevil", () => {
  it("makes a Giant spell cost {2} less", () => {
    const { game } = table();
    spawn(game, "Stinkdrinker Daredevil");
    lands(game, "Mountain", 2);
    const giant = toHand(game, "Hill Giant");
    cast(game, giant);
    expect(zone(game, giant)).toBe("battlefield");
  });
});

describe("Masked Admirers", () => {
  it("returns from the graveyard to hand when you cast a creature spell and pay {G}{G}", () => {
    const { game, a } = table();
    const admirers = toGraveyard(game, "Masked Admirers");
    lands(game, "Forest", 4);
    pickModes(a, 0);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(zone(game, admirers)).toBe("hand");
  });
});

describe("Caterwauling Boggart", () => {
  it("gives your Elementals and Goblins menace, not other creatures", () => {
    const { game } = table();
    const boggart = spawn(game, "Caterwauling Boggart");
    const air = spawn(game, "Air Elemental");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Air Elemental", B);
    expect(keywords(game, boggart).has("menace")).toBe(true);
    expect(keywords(game, air).has("menace")).toBe(true);
    expect(keywords(game, bears).has("menace")).toBe(false);
    expect(keywords(game, theirs).has("menace")).toBe(false);
  });
});

describe("Rootgrapple", () => {
  it("destroys a noncreature permanent and draws only with a Treefolk", () => {
    const { game } = table();
    const stone = spawn(game, "Mind Stone", B);
    lands(game, "Forest", 10);
    let before = hand(game).length;
    cast(game, toHand(game, "Rootgrapple"), { targets: [ref(stone)] });
    expect(zone(game, stone)).toBe("graveyard");
    expect(hand(game).length).toBe(before);
    spawn(game, "Blanchwood Treefolk");
    const other = spawn(game, "Mind Stone", B);
    before = hand(game).length;
    cast(game, toHand(game, "Rootgrapple"), { targets: [ref(other)] });
    expect(zone(game, other)).toBe("graveyard");
    expect(hand(game).length).toBe(before + 1);
  });
});

describe("Pestermite", () => {
  it("may untap target permanent as it enters", () => {
    const { game, a } = table();
    const stone = spawn(game, "Mind Stone", A, { tapped: true });
    lands(game, "Island", 3);
    pickTargets(a, stone);
    pickModes(a, 1);
    cast(game, toHand(game, "Pestermite"));
    expect(game.state.objects[stone].tapped).toBe(false);
  });
});
