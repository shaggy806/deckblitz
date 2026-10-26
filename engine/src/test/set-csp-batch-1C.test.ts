/**
 * Coldsnap, batch 1, group C: the clauses most likely to be wrong — the
 * hybrid cumulative upkeeps ("{G} or {W}", "{U} or {B}") and their
 * age-counter death triggers read through last-known information, the
 * snow-permanent activation gates, protection from snow, Jokulmorder's
 * Island trigger and Balduvian Frostwaker's permanent animation.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  cast,
  controller,
  counters,
  destroy,
  enter,
  keywords,
  lands,
  life,
  nextTurn,
  pickModes,
  pickPermanents,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  types,
  zone,
} from "./harness.js";

describe("Coldsnap batch 1C", () => {
  it("Arctic Nishoba pays two age counters with one {G} and one {W}, and its death counts them", () => {
    const { game, a } = table();
    const nishoba = spawn(game, "Arctic Nishoba");
    lands(game, "Forest", 1);
    lands(game, "Plains", 1);
    pickModes(a, 0);
    nextTurn(game);
    nextTurn(game);
    expect(counters(game, nishoba, "age")).toBe(1);
    nextTurn(game);
    nextTurn(game);
    // Two counters, paid with the Forest and the Plains: no other mana exists.
    expect(counters(game, nishoba, "age")).toBe(2);
    expect(zone(game, nishoba)).toBe("battlefield");
    destroy(game, nishoba);
    expect(zone(game, nishoba)).toBe("graveyard");
    expect(life(game, A)).toBe(24);
  });

  it("Krovikan Whispers steals the creature, takes {U} or {B} per counter, and costs 2 life per counter as it goes", () => {
    const { game, a } = table();
    const bear = spawn(game, "Grizzly Bears", B);
    lands(game, "Island", 1);
    lands(game, "Swamp", 1);
    lands(game, "Wastes", 2);
    const whispers = toHand(game, "Krovikan Whispers");
    cast(game, whispers, { targets: [ref(bear)] });
    expect(zone(game, whispers)).toBe("battlefield");
    expect(controller(game, bear)).toBe(A);
    pickModes(a, 0);
    nextTurn(game);
    nextTurn(game);
    nextTurn(game);
    nextTurn(game);
    // {U/B}{U/B}: the Island and the Swamp (the Wastes can't pay either).
    expect(counters(game, whispers, "age")).toBe(2);
    expect(zone(game, whispers)).toBe("battlefield");
    pickModes(a);
    nextTurn(game);
    nextTurn(game);
    // Declined with three counters: sacrificed, 6 life lost, the Bears go home.
    expect(zone(game, whispers)).toBe("graveyard");
    expect(life(game, A)).toBe(14);
    expect(controller(game, bear)).toBe(B);
  });

  it("Heidar, Rimewind Master activates only with four snow permanents", () => {
    const { game } = table();
    const heidar = spawn(game, "Heidar, Rimewind Master");
    const bear = spawn(game, "Grizzly Bears", B);
    lands(game, "Snow-Covered Island", 3);
    const action = {
      type: "activate-ability" as const,
      player: A,
      source: heidar,
      abilityIndex: 0,
      targets: [ref(bear)],
    };
    expect(game.canDispatch(action)).not.toBeNull();
    lands(game, "Snow-Covered Island", 1);
    activate(game, heidar, 0, { targets: [ref(bear)] });
    expect(zone(game, bear)).toBe("hand");
  });

  it("Ronom Hulk can't be targeted by a snow source's ability", () => {
    const { game } = table();
    const windform = spawn(game, "Adarkar Windform");
    const hulk = spawn(game, "Ronom Hulk", B);
    const bear = spawn(game, "Grizzly Bears", B);
    lands(game, "Snow-Covered Island", 2);
    const at = (id: typeof hulk) =>
      game.canDispatch({ type: "activate-ability", player: A, source: windform, abilityIndex: 0, targets: [ref(id)] });
    expect(at(bear)).toBeNull();
    expect(at(hulk)).not.toBeNull();
  });

  it("Jokulmorder enters tapped, eats five lands, and an Island played untaps it", () => {
    const { game, a } = table();
    const islands = lands(game, "Island", 5);
    pickModes(a, 0);
    pickPermanents(a, ...islands);
    const jok = enter(game, "Jokulmorder");
    expect(zone(game, jok)).toBe("battlefield");
    expect(game.state.objects[jok].tapped).toBe(true);
    expect(islands.every((i) => zone(game, i) === "graveyard")).toBe(true);
    const island = toHand(game, "Island");
    game.dispatch({ type: "play-land", player: A, card: island });
    settle(game);
    expect(game.state.objects[jok].tapped).toBe(false);
  });

  it("Jokulmorder is sacrificed without five lands to give", () => {
    const { game, a } = table();
    lands(game, "Island", 4);
    pickModes(a, 0);
    const jok = enter(game, "Jokulmorder");
    expect(zone(game, jok)).toBe("graveyard");
  });

  it("Balduvian Frostwaker's land stays a 2/2 blue flying Elemental land after the turn", () => {
    const { game, a } = table();
    const waker = spawn(game, "Balduvian Frostwaker");
    lands(game, "Island", 1);
    const snow = spawn(game, "Snow-Covered Forest");
    pickTargets(a, snow);
    activate(game, waker, 0, { targets: [ref(snow)] });
    nextTurn(game);
    expect(types(game, snow)).toEqual(expect.arrayContaining(["land", "creature"]));
    expect(pt(game, snow)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, snow).has("flying")).toBe(true);
    expect(game.state.objects[snow].zone).toBe("battlefield");
  });
});
