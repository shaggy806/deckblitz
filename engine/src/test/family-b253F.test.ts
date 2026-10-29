/**
 * B253 group F: cards freed by "can't be blocked by [X] this turn", granted
 * statics, rule 305.7's land-type setting and the exchange of control.
 */

import { describe, expect, it } from "vitest";

import {
  A,
  B,
  C,
  activate,
  blockOffer,
  cast,
  controller,
  counters,
  hand,
  life,
  loyalty,
  nextTurn,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toHand,
} from "./harness.js";

const canBlock = (offer: ReturnType<typeof blockOffer>, blocker: string): readonly string[] =>
  offer.eligible.find((e) => e.blocker === blocker)?.canBlock ?? [];

describe("B253 group F", () => {
  it("Rikku: a creature you put a counter on can't be blocked by your opponents' creatures this turn", () => {
    const { game, a } = table();
    spawn(game, "Rikku, Resourceful Guardian", A);
    const bears = spawn(game, "Grizzly Bears", A);
    const other = spawn(game, "Hill Giant", A);
    const giant = spawn(game, "Hill Giant", B);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(bears)]);
    settle(game);
    const offer = blockOffer(game, a, [bears, other]);
    expect(canBlock(offer, giant)).toEqual([other]);
  });

  it("Rikku's Steal moves a counter from an opponent's creature onto yours", () => {
    const { game } = table();
    const rikku = spawn(game, "Rikku, Resourceful Guardian", A);
    spawn(game, "Island", A);
    const mine = spawn(game, "Grizzly Bears", A);
    const theirs = spawn(game, "Hill Giant", B);
    game.state.objects[theirs].counters["+1/+1"] = 2;
    activate(game, rikku, 0, { targets: [ref(theirs), ref(mine)] });
    expect(counters(game, theirs)).toBe(1);
    expect(counters(game, mine)).toBe(1);
  });

  it("Ms. Marvel: a spell targeting your creature draws, and her base power becomes your hand size", () => {
    const { game } = table();
    const marvel = spawn(game, "Ms. Marvel, Kamala Khan", A);
    spawn(game, "Forest", A);
    const before = hand(game, A).length;
    cast(game, toHand(game, "Giant Growth"), { targets: [ref(marvel)] });
    // The Growth was added to the hand, then cast; the draw puts one back.
    expect(hand(game, A).length).toBe(before + 1);
    expect(pt(game, marvel)).toEqual({ power: hand(game, A).length + 3, toughness: 7 });
    nextTurn(game);
    expect(pt(game, marvel).power).toBe(1);
  });

  it("Dread Charge: your black creatures can be blocked only by black creatures this turn", () => {
    const { game, a } = table();
    const corpse = spawn(game, "Walking Corpse", A);
    const bears = spawn(game, "Grizzly Bears", A);
    for (let i = 0; i < 4; i++) spawn(game, "Swamp", A);
    const giant = spawn(game, "Hill Giant", B);
    const blackBlocker = spawn(game, "Walking Corpse", B);
    cast(game, toHand(game, "Dread Charge"));
    const offer = blockOffer(game, a, [corpse, bears]);
    expect(canBlock(offer, giant)).toEqual([bears]);
    expect([...canBlock(offer, blackBlocker)].sort()).toEqual([corpse, bears].sort());
  });

  it("Rime Transfusion: +2/+1, and its {S} ability keeps nonsnow creatures from blocking", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    spawn(game, "Swamp", A);
    spawn(game, "Swamp", A);
    spawn(game, "Snow-Covered Swamp", A);
    cast(game, toHand(game, "Rime Transfusion"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 3 });
    activate(game, bears, 0);
    const giant = spawn(game, "Hill Giant", B);
    const treefolk = spawn(game, "Abominable Treefolk", B);
    const offer = blockOffer(game, a, [bears]);
    expect(canBlock(offer, giant)).toEqual([]);
    expect(canBlock(offer, treefolk)).toEqual([bears]);
  });

  it("Jinx: the land becomes the chosen basic type; a card is drawn at the next upkeep", () => {
    const { game, a } = table();
    const coast = spawn(game, "Yavimaya Coast", B);
    spawn(game, "Island", A);
    spawn(game, "Island", A);
    a.chooseCreatureTypeFn = (_view, _source, options) => (options.includes("Swamp") ? "Swamp" : options[0]);
    cast(game, toHand(game, "Jinx"), { targets: [ref(coast)] });
    expect(subtypes(game, coast)).toEqual(["Swamp"]);
    const before = hand(game, A).length;
    nextTurn(game);
    expect(subtypes(game, coast)).toEqual([]);
    // Bob's turn: Alice draws off Jinx's delayed trigger in his upkeep.
    expect(hand(game, A).length).toBe(before + 1);
  });

  it("Gilt-Leaf Archdruid: tapping seven Druids takes every land the target player controls", () => {
    const { game } = table({ players: 3 });
    const druid = spawn(game, "Gilt-Leaf Archdruid", A);
    for (let i = 0; i < 6; i++) spawn(game, "Gilt-Leaf Archdruid", A, { sick: true });
    const bobs = [spawn(game, "Forest", B), spawn(game, "Island", B)];
    const carols = spawn(game, "Forest", C);
    activate(game, druid, 0, { targets: [ref(B)] });
    expect(bobs.map((id) => controller(game, id))).toEqual([A, A]);
    expect(controller(game, carols)).toBe(C);
  });

  it("Tezzeret's −8 takes the target opponent's artifacts and creatures only", () => {
    const { game } = table({ players: 3 });
    const tez = spawn(game, "Tezzeret, Master of Metal", A);
    const ring = spawn(game, "Sol Ring", B);
    const bears = spawn(game, "Grizzly Bears", B);
    const land = spawn(game, "Forest", B);
    const carols = spawn(game, "Grizzly Bears", C);
    loyalty(game, tez, -8, { atLeast: 8, targets: [ref(B)] });
    expect([ring, bears].map((id) => controller(game, id))).toEqual([A, A]);
    expect(controller(game, land)).toBe(B);
    expect(controller(game, carols)).toBe(C);
  });

  it("Tezzeret's −3: the opponent loses life equal to your artifacts", () => {
    const { game } = table();
    const tez = spawn(game, "Tezzeret, Master of Metal", A);
    spawn(game, "Sol Ring", A);
    spawn(game, "Ornithopter", A);
    loyalty(game, tez, -3, { targets: [ref(B)] });
    expect(life(game, B)).toBe(18);
  });
});
