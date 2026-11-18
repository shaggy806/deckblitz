/**
 * A cost that exiles several permanents (`AbilityCost.exilesSacrifice` of an
 * `each` — The Book of Vile Darkness's "Exile The Book of Vile Darkness and
 * artifacts you control named Eye of Vecna and Hand of Vecna"), and a token
 * made with the exiled cards' triggered abilities as copiable values
 * (`create-token`'s `withTriggeredOf` — "with all triggered abilities of the
 * exiled cards").
 */
import { describe, expect, it } from "vitest";
import type { LegalAction } from "../actions.js";
import { A, activate, hand, keywords, life, named, nextTurn, pt, ref, settle, spawn, table, toStep, zone } from "./harness.js";

describe("The Book of Vile Darkness", () => {
  it("exiles itself, the Eye and the Hand, and Vecna has their triggered abilities", () => {
    const { game } = table();
    const book = spawn(game, "The Book of Vile Darkness", A);
    const eye = spawn(game, "Eye of Vecna", A);
    const handOf = spawn(game, "Hand of Vecna", A);
    const cards = hand(game, A).length;
    activate(game, book);
    expect([zone(game, book), zone(game, eye), zone(game, handOf)]).toEqual(["exile", "exile", "exile"]);
    const [vecna] = named(game, "Vecna Token", A);
    expect(vecna).toBeDefined();
    expect(game.state.objects[vecna].isToken).toBe(true);
    expect(pt(game, vecna)).toEqual({ power: 8, toughness: 8 });
    expect(keywords(game, vecna).has("indestructible")).toBe(true);
    // The Eye's "When Eye of Vecna enters" is Vecna's own, there as it entered.
    expect(hand(game, A).length).toBe(cards + 1);
    expect(life(game, A)).toBe(18);
    // The Hand's "a creature you control named Vecna gets +X/+X".
    toStep(game, "begin-combat", A);
    settle(game);
    expect(pt(game, vecna).power).toBe(8 + hand(game, A).length);
  });

  it("isn't a sacrifice: nothing dies", () => {
    const { game } = table();
    const book = spawn(game, "The Book of Vile Darkness", A);
    spawn(game, "Eye of Vecna", A);
    spawn(game, "Hand of Vecna", A);
    activate(game, book);
    expect(game.eventsOfType("permanent-sacrificed")).toEqual([]);
  });

  it("can't be activated without the Hand", () => {
    const { game } = table();
    const book = spawn(game, "The Book of Vile Darkness", A);
    spawn(game, "Eye of Vecna", A);
    expect(
      game.canDispatch({ type: "activate-ability", player: A, source: book, abilityIndex: 0, targets: [] }),
    ).not.toBeNull();
    expect(zone(game, book)).toBe("battlefield");
  });

  it("asks which one to exile where two could pay a part, and says exile", () => {
    // Two Eyes at once, before the legend rule is checked: a part with a choice.
    const { game } = table();
    const book = spawn(game, "The Book of Vile Darkness", A);
    const eyes = [spawn(game, "Eye of Vecna", A), spawn(game, "Eye of Vecna", A)];
    spawn(game, "Hand of Vecna", A);
    activate(game, book, 0, { settle: false });
    const asked = game.legalActions(A).find((a): a is Extract<LegalAction, { kind: "sacrifice" }> => a.kind === "sacrifice");
    expect(asked?.exile).toBe(true);
    expect([...(asked?.eligible ?? [])].sort()).toEqual([...eyes].sort());
    game.dispatch({ type: "sacrifice", player: A, permanents: [eyes[1]] });
    expect(zone(game, eyes[1])).toBe("exile");
    expect(zone(game, eyes[0])).toBe("battlefield");
  });

  it("gives Vecna's copy the triggered abilities too: they're copiable values", () => {
    const { game } = table();
    const book = spawn(game, "The Book of Vile Darkness", A);
    spawn(game, "Eye of Vecna", A);
    spawn(game, "Hand of Vecna", A);
    activate(game, book);
    const [vecna] = named(game, "Vecna Token", A);
    const before = { cards: hand(game, A).length, life: life(game, A) };
    game.debugApplyEffect(
      A,
      { kind: "create-token-copy", of: 0, count: 1, exceptions: { removeSupertypes: ["legendary"] } },
      [ref(vecna)],
    );
    settle(game);
    expect(named(game, "Vecna Token", A).length).toBe(2);
    // The copy's own "When Eye of Vecna enters".
    expect(hand(game, A).length).toBe(before.cards + 1);
    expect(life(game, A)).toBe(before.life - 2);
  });

  it("makes a 2/2 Zombie at your end step only if you lost 2 or more life", () => {
    const { game } = table();
    spawn(game, "The Book of Vile Darkness", A);
    game.debugApplyEffect(A, { kind: "lose-life", amount: 1 });
    toStep(game, "end", A);
    settle(game);
    expect(named(game, "Zombie Token", A)).toEqual([]);
    nextTurn(game);
    nextTurn(game);
    game.debugApplyEffect(A, { kind: "lose-life", amount: 2 });
    toStep(game, "end", A);
    settle(game);
    expect(named(game, "Zombie Token", A).length).toBe(1);
  });
});
