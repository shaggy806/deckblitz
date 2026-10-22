/**
 * Aether Revolt, group V (and the "discard any number" rechecks): the clause
 * of each card most likely to be wrong.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  blockOffer,
  cast,
  counters,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  enter,
  table,
  toHand,
  toStep,
  types,
  zone,
  type BlockOffer,
} from "./harness.js";

const energy = (game: Game, player = A): number => game.state.players[player].energy;
const tapped = (game: Game, id: ObjectId): boolean => game.state.objects[id].tapped === true;
/** A Vehicle becomes an artifact creature until end of turn, as crewing would. */
const animate = (game: Game, id: ObjectId): void =>
  game.debugApplyEffect(A, { kind: "add-types", target: 0, addTypes: ["artifact", "creature"], duration: "end-of-turn" }, [ref(id)]);
const canBlock = (offer: BlockOffer, blocker: ObjectId): readonly ObjectId[] =>
  offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];

describe("AER group V", () => {
  it("Aethertide Whale: six energy on entering, four of it to return to hand", () => {
    const { game } = table();
    const whale = enter(game, "Aethertide Whale");
    expect(energy(game)).toBe(6);
    activate(game, whale);
    expect(zone(game, whale)).toBe("hand");
    expect(energy(game)).toBe(2);
  });

  it("Scrounging Bandar moves the chosen number of counters onto another target creature", () => {
    const { game, a } = table();
    const bandar = enter(game, "Scrounging Bandar");
    expect(counters(game, bandar)).toBe(2);
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    const asked: string[][] = [];
    a.chooseModesFn = (_view, _min, _max, texts) => {
      asked.push([...texts]);
      const i = texts.findIndex((t) => t.includes("a +1/+1"));
      return i < 0 ? [] : [i];
    };
    toStep(game, "upkeep");
    settle(game);
    expect(asked[0]).toEqual(["Move no +1/+1 counters", "Move a +1/+1 counter", "Move 2 +1/+1 counters"]);
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, bandar)).toBe(1);
  });

  it("Mobile Garrison untaps another artifact or creature you control as it attacks", () => {
    const { game, a } = table();
    const garrison = spawn(game, "Mobile Garrison");
    const bears = spawn(game, "Grizzly Bears", A, { tapped: true });
    animate(game, garrison);
    pickTargets(a, bears);
    attack(game, a, [garrison]);
    expect(tapped(game, bears)).toBe(false);
    expect(life(game, B)).toBe(17);
  });

  it("Glint-Sleeve Siphoner: energy on entering and attacking; pay two at upkeep to draw and lose 1", () => {
    const { game, a } = table();
    const siphoner = enter(game, "Glint-Sleeve Siphoner");
    expect(energy(game)).toBe(1);
    attack(game, a, [siphoner]);
    expect(energy(game)).toBe(2);
    a.chooseModesFn = () => [0];
    const before = hand(game).length;
    toStep(game, "upkeep");
    settle(game);
    expect(hand(game).length).toBe(before + 1);
    expect(life(game, A)).toBe(19);
    expect(energy(game)).toBe(0);
  });

  it("Implement of Ferocity draws as it's sacrificed to its own ability", () => {
    const { game } = table();
    const implement = spawn(game, "Implement of Ferocity");
    lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears");
    const before = hand(game).length;
    activate(game, implement, 0, { targets: [ref(bears)] });
    expect(counters(game, bears)).toBe(1);
    expect(hand(game).length).toBe(before + 1);
    expect(graveyard(game)).toContain(implement);
  });

  it("Aerial Modification makes an enchanted Vehicle a 5/6 flying creature", () => {
    const { game } = table();
    lands(game, "Plains", 5);
    const garrison = spawn(game, "Mobile Garrison");
    expect(types(game, garrison)).not.toContain("creature");
    cast(game, toHand(game, "Aerial Modification"), { targets: [ref(garrison)] });
    expect(types(game, garrison)).toContain("creature");
    expect(pt(game, garrison)).toEqual({ power: 5, toughness: 6 });
    expect(keywords(game, garrison).has("flying")).toBe(true);
  });

  it("Caught in the Brights exiles the enchanted creature when a Vehicle you control attacks", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    const theirs = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Caught in the Brights"), { targets: [ref(theirs)] });
    expect(zone(game, theirs)).toBe("battlefield");
    // A creature attacking alone doesn't do it.
    const bears = spawn(game, "Grizzly Bears");
    attack(game, a, [bears]);
    expect(zone(game, theirs)).toBe("battlefield");
    toStep(game, "precombat-main");
    const garrison = spawn(game, "Mobile Garrison");
    animate(game, garrison);
    attack(game, a, [garrison]);
    expect(zone(game, theirs)).toBe("exile");
  });

  it("Hinterland Drake can't block an artifact creature", () => {
    const { game, a } = table();
    const drake = spawn(game, "Hinterland Drake", B);
    const thopter = spawn(game, "Ornithopter");
    const bears = spawn(game, "Grizzly Bears");
    const offer = blockOffer(game, a, [thopter, bears]);
    expect(canBlock(offer, drake)).toEqual([bears]);
  });

  it("Neheb discards any number on combat damage, draws that many and adds that much {R} that lasts", () => {
    const { game, a } = table();
    const neheb = spawn(game, "Neheb, Dreadhorde Champion");
    const before = hand(game).length;
    a.chooseDiscardsFn = (cards) => cards.slice(0, 2).map((c) => c.id);
    attack(game, a, [neheb]);
    expect(life(game, B)).toBe(15);
    expect(graveyard(game).length).toBe(2);
    expect(hand(game).length).toBe(before);
    // Still there in the postcombat main phase.
    expect(game.state.players[A].manaPool.map((u) => u.type)).toEqual(["R", "R"]);
  });

  it("Neheb's trigger fires on combat damage to a planeswalker too", () => {
    const { game, a } = table();
    const neheb = spawn(game, "Neheb, Dreadhorde Champion");
    const walker = spawn(game, "Ajani Vengeant", B);
    let asked = 0;
    a.chooseDiscardsFn = (cards) => {
      asked += 1;
      return cards.slice(0, 1).map((c) => c.id);
    };
    attack(game, a, [neheb], walker);
    expect(asked).toBe(1);
    expect(game.state.players[A].manaPool.map((u) => u.type)).toEqual(["R"]);
  });

  it("The Elder Dragon War's chapter I deals 2 to each creature and each opponent, not you", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    a.chooseCreatureTypeFn = () => "1";
    cast(game, toHand(game, "The Elder Dragon War"));
    expect(zone(game, mine)).toBe("graveyard");
    expect(zone(game, theirs)).toBe("graveyard");
    expect(life(game, B)).toBe(18);
    expect(life(game, A)).toBe(20);
  });

  it("The Elder Dragon War's chapter II discards any number and draws that many", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    a.chooseCreatureTypeFn = () => "2";
    a.chooseDiscardsFn = (cards) => cards.slice(0, 3).map((c) => c.id);
    const saga = toHand(game, "The Elder Dragon War");
    const before = hand(game).length;
    cast(game, saga);
    expect(graveyard(game).length).toBe(3);
    expect(hand(game).length).toBe(before - 1);
  });

  it("Lifecrafter's Gift: the target's own counter qualifies it for the second", () => {
    const { game } = table();
    lands(game, "Forest", 4);
    const target = spawn(game, "Grizzly Bears");
    const marked = spawn(game, "Grizzly Bears");
    const bare = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    game.state.objects[marked].counters["+1/+1"] = 1;
    game.state.objects[theirs].counters["+1/+1"] = 1;
    cast(game, toHand(game, "Lifecrafter's Gift"), { targets: [ref(target)] });
    expect(counters(game, target)).toBe(2);
    expect(counters(game, marked)).toBe(2);
    expect(counters(game, bare)).toBe(0);
    expect(counters(game, theirs)).toBe(1);
  });
});
