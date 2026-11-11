/**
 * Batch B296, group A: cards a re-read of the blocked records found
 * authorable. One test per card, on the clause its old record blocked it for.
 */
import { describe, expect, it } from "vitest";
import { activePlayerOf } from "../state.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  controller,
  counters,
  destroy,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  nextTurn,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  subtypes,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  toStep,
  tokensNamed,
  types,
  watchTargets,
  zone,
} from "./harness.js";

describe("B296 group A", () => {
  it("Dire Fleet Ravager: each player loses a third of their life, rounded up", () => {
    const { game } = table();
    enter(game, "Dire Fleet Ravager");
    expect(life(game, A)).toBe(13);
    expect(life(game, B)).toBe(13);
  });

  it("Pox: a third of life, hand, creatures and lands, each rounded up", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    for (let i = 0; i < 4; i += 1) spawn(game, "Grizzly Bears", B);
    const pox = toHand(game, "Pox");
    const bHand = hand(game, B).length;
    cast(game, pox);
    expect(life(game, A)).toBe(13);
    expect(life(game, B)).toBe(13);
    expect(hand(game, B).length).toBe(bHand - Math.ceil(bHand / 3));
    expect(named(game, "Grizzly Bears", B).length).toBe(2);
    expect(named(game, "Swamp", A).length).toBe(2);
  });

  it("Prophet of the Scarab: draws the greater of the two Zombie counts", () => {
    const { game } = table();
    for (let i = 0; i < 3; i += 1) toGraveyard(game, "Prophet of the Scarab");
    const before = hand(game).length;
    enter(game, "Prophet of the Scarab");
    // One Zombie on the battlefield (itself), three in the graveyard.
    expect(hand(game).length).toBe(before + 3);
  });

  it("Inferno of the Star Mounts: 20 damage only as the pump makes its power exactly 20", () => {
    const { game, a } = table({ life: 40 });
    const inferno = spawn(game, "Inferno of the Star Mounts");
    lands(game, "Mountain", 16);
    pickTargets(a, B);
    for (let i = 0; i < 13; i += 1) activate(game, inferno);
    expect(pt(game, inferno).power).toBe(19);
    expect(life(game, B)).toBe(40);
    activate(game, inferno);
    expect(pt(game, inferno).power).toBe(20);
    expect(life(game, B)).toBe(20);
    activate(game, inferno);
    expect(pt(game, inferno).power).toBe(21);
    expect(life(game, B)).toBe(20);
  });

  it("Sage of Hours: an extra turn for each five counters removed", () => {
    const { game } = table();
    const sage = spawn(game, "Sage of Hours");
    game.state.objects[sage].counters["+1/+1"] = 12;
    activate(game, sage);
    expect(counters(game, sage)).toBe(0);
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(A);
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(A);
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(B);
  });

  it("Twins of Discord: another colorless creature has bloodthirst 2", () => {
    const { game } = table();
    spawn(game, "Twins of Discord");
    const early = enter(game, "Ornithopter");
    expect(counters(game, early)).toBe(0);
    game.debugApplyEffect(A, { kind: "damage", amount: 1, target: 0 }, [ref(B)]);
    settle(game);
    const late = enter(game, "Ornithopter");
    expect(counters(game, late)).toBe(2);
    const green = enter(game, "Grizzly Bears");
    expect(counters(game, green)).toBe(0);
  });

  it("Gor Muldrak: only the players with the fewest creatures get a Salamander", () => {
    const { game } = table();
    spawn(game, "Gor Muldrak, Amphinologist");
    toStep(game, "end");
    settle(game);
    expect(tokensNamed(game, "Salamander Warrior Token", B)).toBe(1);
    expect(tokensNamed(game, "Salamander Warrior Token", A)).toBe(0);
  });

  it("Quicksilver Fountain: the upkeep's player floods their own land, and the end step drains them", () => {
    const { game, a } = table();
    spawn(game, "Quicksilver Fountain");
    const forest = spawn(game, "Forest");
    pickTargets(a, forest);
    toStep(game, "upkeep");
    settle(game);
    expect(counters(game, forest, "flood")).toBe(1);
    expect(subtypes(game, forest)).toEqual(["Island"]);
    // Every land is now an Island, so the end step takes the counters off.
    toStep(game, "end");
    settle(game);
    expect(counters(game, forest, "flood")).toBe(0);
    expect(subtypes(game, forest)).toEqual(["Forest"]);
  });

  it("Tectonic Split: half the lands, rounded up, are sacrificed to cast it", () => {
    const { game } = table();
    lands(game, "Forest", 7);
    cast(game, toHand(game, "Tectonic Split"));
    expect(named(game, "Tectonic Split").length).toBe(1);
    expect(named(game, "Forest").length).toBe(3);
  });

  it("Apothecary White: a Food for each player attacked", () => {
    const { game, a } = table();
    const white = spawn(game, "Apothecary White");
    attack(game, a, [white]);
    expect(tokensNamed(game, "Food Token", A)).toBe(1);
  });

  it("Okoye: the watched creature gains double strike and trample as it attacks the monarch", () => {
    const { game, a } = table();
    const okoye = enter(game, "Okoye, Mighty and Adored");
    expect(game.state.monarch).toBe(A);
    game.debugApplyEffect(B, { kind: "become-monarch" }, []);
    settle(game);
    pickTargets(a, okoye);
    attack(game, a, [okoye]);
    expect(counters(game, okoye)).toBe(1);
    expect(keywords(game, okoye).has("double-strike")).toBe(true);
    expect(keywords(game, okoye).has("trample")).toBe(true);
  });

  it("Frantic Scapegoat: passes its suspicion to a creature that just entered", () => {
    const { game, a } = table();
    const goat = enter(game, "Frantic Scapegoat");
    expect(game.state.objects[goat].suspectedAt).toBeDefined();
    const old = spawn(game, "Hill Giant");
    const seen = pickPermanents(a);
    a.choosePermanentsFn = (_view, eligible) => {
      seen.offered = eligible;
      return [eligible[0]];
    };
    const bears = enter(game, "Grizzly Bears");
    // Only the creature that just entered is offered, not one already there.
    expect(seen.offered).toEqual([bears]);
    expect(seen.offered).not.toContain(old);
    expect(game.state.objects[bears].suspectedAt).toBeDefined();
    expect(game.state.objects[goat].suspectedAt).toBeUndefined();
  });

  it("Midnight Arsonist: can't target an artifact with a mana ability", () => {
    const { game, a } = table();
    const ring = spawn(game, "Sol Ring", B);
    const club = spawn(game, "Bonesplitter", B);
    const seen = watchTargets(a, () => [club]);
    enter(game, "Midnight Arsonist");
    expect(seen.offered[0]).toContain(club);
    expect(seen.offered[0]).not.toContain(ring);
    expect(zone(game, club)).toBe("graveyard");
  });

  it("Namor: a Merfolk for each blue symbol in a noncreature spell's cost", () => {
    const { game } = table();
    const namor = spawn(game, "Namor the Sub-Mariner");
    lands(game, "Island", 3);
    expect(pt(game, namor).power).toBe(1);
    cast(game, toHand(game, "Divination"));
    expect(tokensNamed(game, "Merfolk Token", A)).toBe(1);
    expect(pt(game, namor).power).toBe(2);
  });

  it("Yennett: an even card isn't cast and is drawn instead", () => {
    const { game, a } = table();
    const yennett = spawn(game, "Yennett, Cryptic Sovereign");
    const bears = toLibrary(game, "Grizzly Bears");
    attack(game, a, [yennett]);
    expect(zone(game, bears)).toBe("hand");
  });

  it("Rasaad yn Bashir: doubles each creature's toughness while you have the initiative", () => {
    const { game, a } = table();
    const rasaad = spawn(game, "Rasaad yn Bashir");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "take-initiative" }, []);
    settle(game);
    attack(game, a, [rasaad]);
    expect(pt(game, rasaad).toughness).toBe(6);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 4 });
  });

  it("Obosh: doubles damage from a source with an odd mana value only", () => {
    const { game } = table();
    spawn(game, "Obosh, the Preypiercer");
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Shock"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
    cast(game, toHand(game, "Lightning Strike"), { targets: [ref(B)] });
    expect(life(game, B)).toBe(13);
  });

  it("Gnoll War Band: costs {1} less for each opponent dealt damage this turn", () => {
    const { game } = table();
    lands(game, "Mountain", 5);
    const band = toHand(game, "Gnoll War Band");
    expect(() => cast(game, band)).toThrow(/refused/);
    game.debugApplyEffect(A, { kind: "damage", amount: 1, target: 0 }, [ref(B)]);
    settle(game);
    cast(game, band);
    expect(zone(game, band)).toBe("battlefield");
  });

  it("Vraska, the Silencer: the creature returns as only a Treasure artifact", () => {
    const { game, a } = table();
    spawn(game, "Vraska, the Silencer");
    lands(game, "Swamp", 1);
    const bears = spawn(game, "Grizzly Bears", B);
    pickModes(a, 0);
    destroy(game, bears, A);
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(types(game, bears)).toEqual(["artifact"]);
    expect(subtypes(game, bears)).toEqual(["Treasure"]);
  });

  it("Ugin's Binding: exiled from the graveyard to return each nonland permanent you don't control", () => {
    const { game, a } = table();
    const binding = toGraveyard(game, "Ugin's Binding");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Wastes", 7);
    pickModes(a, 0);
    cast(game, toHand(game, "Twins of Discord"));
    expect(zone(game, binding)).toBe("exile");
    expect(zone(game, bears)).toBe("hand");
  });

  it("Banon: paying {1} and discarding a card draws one", () => {
    const { game, a } = table();
    const banon = spawn(game, "Banon, the Returners' Leader");
    lands(game, "Plains", 1);
    pickModes(a, 0);
    const before = hand(game).length;
    const yard = graveyard(game).length;
    attack(game, a, [banon]);
    expect(hand(game).length).toBe(before);
    expect(graveyard(game).length).toBe(yard + 1);
  });

  it("Glissa's Retriever: exiles itself, and returns nothing with no poisoned opponent", () => {
    const { game, a } = table();
    const retriever = spawn(game, "Glissa's Retriever");
    const bears = toGraveyard(game, "Grizzly Bears");
    // Up to zero targets: answering with one is refused, so none is taken.
    pickTargets(a);
    destroy(game, retriever);
    expect(zone(game, retriever)).toBe("exile");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("Hypergenesis: has no mana cost, so it can't be cast from hand", () => {
    const { game } = table();
    lands(game, "Forest", 5);
    const card = toHand(game, "Hypergenesis");
    expect(() => cast(game, card)).toThrow(/refused/);
    expect(zone(game, card)).toBe("hand");
  });
});
