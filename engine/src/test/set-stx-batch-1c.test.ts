/**
 * Strixhaven: School of Mages, batch 1, group c — the clause of each card
 * most likely to be wrong.
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
  keywords,
  lands,
  life,
  named,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  supertypes,
  table,
  toGraveyard,
  toHand,
  watchTargets,
  zone,
} from "./harness.js";

describe("Strixhaven batch 1c", () => {
  it("Venerable Warsinger: X is the damage dealt — only creature cards with mana value 3 or less", () => {
    const { game, a } = table();
    const warsinger = spawn(game, "Venerable Warsinger");
    const bears = toGraveyard(game, "Grizzly Bears");
    const ape = toGraveyard(game, "Kird Ape");
    // Mana value 4: one more than the 3 damage dealt.
    const giant = toGraveyard(game, "Hill Giant");
    const seen = watchTargets(a, () => [bears]);
    pickModes(a, 0);
    attack(game, a, [warsinger]);
    expect(seen.asked).toBe(1);
    expect(seen.offered[0]).toContain(bears);
    expect(seen.offered[0]).toContain(ape);
    expect(seen.offered[0]).not.toContain(giant);
    expect(zone(game, bears)).toBe("battlefield");
    expect(life(game, B)).toBe(17);
  });

  it("Augmenter Pugilist gets +5/+5 only with eight or more lands", () => {
    const { game } = table();
    const pugilist = spawn(game, "Augmenter Pugilist");
    lands(game, "Forest", 7);
    expect(pt(game, pugilist)).toEqual({ power: 3, toughness: 3 });
    lands(game, "Forest", 1);
    expect(pt(game, pugilist)).toEqual({ power: 8, toughness: 8 });
  });

  it("Echoing Equation: each other creature you control becomes a nonlegendary copy until end of turn", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const isamaru = spawn(game, "Isamaru, Hound of Konda");
    const giant = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Grizzly Bears", B);
    const card = toHand(game, "Augmenter Pugilist");
    cast(game, card, { face: 1, targets: [ref(isamaru)] });
    // Hill Giant is a 3/3: as a copy of Isamaru it's a 2/2.
    expect(pt(game, giant)).toEqual({ power: 2, toughness: 2 });
    expect(supertypes(game, giant)).not.toContain("legendary");
    expect(supertypes(game, isamaru)).toContain("legendary");
    expect(zone(game, isamaru)).toBe("battlefield");
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });

  it("Rootha returns itself to hand to copy your instant", () => {
    const { game, a } = table();
    lands(game, "Mountain", 3);
    const rootha = spawn(game, "Rootha, Mercurial Artist");
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [ref(B)], settle: false });
    const spell = game.state.zones.shared.stack[0];
    pickModes(a);
    activate(game, rootha, 0, { targets: [ref(spell)] });
    expect(zone(game, rootha)).toBe("hand");
    expect(life(game, B)).toBe(16);
  });

  it("Team Pennant's cheap equip reaches only a creature token", () => {
    const { game } = table();
    lands(game, "Wastes", 4);
    const pennant = spawn(game, "Team Pennant");
    const bears = spawn(game, "Grizzly Bears");
    game.debugApplyEffect(A, { kind: "create-token", token: "Soldier Token", count: 1 }, []);
    const soldier = named(game, "Soldier Token")[0];
    expect(() => activate(game, pennant, 0, { targets: [ref(bears)] })).toThrow();
    activate(game, pennant, 0, { targets: [ref(soldier)] });
    expect(pt(game, soldier)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, soldier).has("vigilance")).toBe(true);
    expect(keywords(game, soldier).has("trample")).toBe(true);
    activate(game, pennant, 1, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });

  it("Devouring Tendrils: the life comes when that permanent dies later this turn too", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    const bears = spawn(game, "Grizzly Bears");
    const angel = spawn(game, "Serra Angel", B);
    const tendrils = toHand(game, "Devouring Tendrils");
    cast(game, tendrils, { targets: [ref(bears), ref(angel)] });
    expect(zone(game, angel)).toBe("battlefield");
    expect(life(game, A)).toBe(20);
    destroy(game, angel);
    expect(life(game, A)).toBe(22);
  });

  it("Confront the Past: returns a planeswalker card with mana value X or less", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const jace = toGraveyard(game, "Jace Beleren");
    const past = toHand(game, "Confront the Past");
    expect(() => cast(game, past, { x: 2, modes: [0], targets: [ref(jace)] })).toThrow();
    cast(game, past, { x: 3, modes: [0], targets: [ref(jace)] });
    expect(zone(game, jace)).toBe("battlefield");
  });

  it("Confront the Past: removes twice X loyalty counters", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const chandra = spawn(game, "Chandra, Torch of Defiance", B);
    game.state.objects[chandra].counters.loyalty = 5;
    const past = toHand(game, "Confront the Past");
    cast(game, past, { x: 2, modes: [1], targets: [ref(chandra)] });
    expect(counters(game, chandra, "loyalty")).toBe(1);
  });

  it("Dream Strix is sacrificed when a spell targets it, not an ability; it learns as it dies", () => {
    const { game, a } = table();
    lands(game, "Mountain", 1);
    const strix = spawn(game, "Dream Strix");
    const sorcerer = spawn(game, "Prodigal Sorcerer");
    pickModes(a);
    activate(game, sorcerer, 0, { targets: [ref(strix)] });
    expect(zone(game, strix)).toBe("battlefield");
    const before = game.state.zones.perPlayer[A].hand.length;
    const opt = toHand(game, "Opt");
    a.chooseDiscardsFn = () => [opt];
    pickModes(a, 0);
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [ref(strix)] });
    settle(game);
    expect(zone(game, strix)).toBe("graveyard");
    // Learn: Opt discarded, a card drawn — Shock is gone, Opt and the draw net out.
    expect(zone(game, opt)).toBe("graveyard");
    expect(game.state.zones.perPlayer[A].hand.length).toBe(before + 1);
  });

  it("Rise of Extus exiles the creature and the instant card", () => {
    const { game, a } = table();
    lands(game, "Plains", 6);
    const bears = spawn(game, "Grizzly Bears", B);
    const opt = toGraveyard(game, "Opt", B);
    const rise = toHand(game, "Rise of Extus");
    pickModes(a);
    cast(game, rise, { targets: [ref(bears), ref(opt)] });
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, opt)).toBe("exile");
  });
});
