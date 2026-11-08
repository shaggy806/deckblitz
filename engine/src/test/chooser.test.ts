/**
 * Theme 5 of docs/plans/need-key-themes.md: one chooser type, and each-player
 * choices in APNAP order.
 */
import { describe, expect, it } from "vitest";
import { A, B, attack, pickModes, cast, graveyard, hand, pickPermanents, spawn, table, toHand, toLibrary, zone } from "./harness.js";

describe("per-player rounds and other players choosing", () => {
  it("Curfew: each player returns a creature they control", () => {
    const { game, a, b } = table();
    const mine = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    pickPermanents(a, mine);
    pickPermanents(b, theirs);
    spawn(game, "Island");
    cast(game, toHand(game, "Curfew"));
    expect(zone(game, mine)).toBe("hand");
    expect(zone(game, theirs)).toBe("hand");
  });

  it("Bane of Bala Ged: the defending player exiles two of their own permanents", () => {
    const { game, a, b } = table();
    const bane = spawn(game, "Bane of Bala Ged");
    const one = spawn(game, "Grizzly Bears", B);
    const two = spawn(game, "Hill Giant", B);
    spawn(game, "Forest", B);
    pickPermanents(b, one, two);
    attack(game, a, [bane], B);
    expect(zone(game, one)).toBe("exile");
    expect(zone(game, two)).toBe("exile");
  });

  it("Eureka repeats until a round in which nobody puts a card down", () => {
    const { game, a } = table();
    game.state.zones.perPlayer[A].hand = [];
    game.state.zones.perPlayer[B].hand = [];
    const first = toHand(game, "Grizzly Bears");
    const second = toHand(game, "Hill Giant");
    let answers = 0;
    pickModes(a, 0);
    a.chooseFromZoneFn = (_v, eligible) => {
      answers += 1;
      return eligible.slice(0, 1);
    };
    spawn(game, "Forest");
    spawn(game, "Forest");
    spawn(game, "Forest");
    spawn(game, "Forest");
    cast(game, toHand(game, "Eureka"));
    expect(zone(game, first)).toBe("battlefield");
    expect(zone(game, second)).toBe("battlefield");
    expect(answers).toBeGreaterThanOrEqual(2);
  });

  it("Eumidian Wastewaker: both choose, and each land put in a graveyard draws a card", () => {
    const { game, a } = table();
    const worm = spawn(game, "Eumidian Wastewaker");
    for (let i = 0; i < 3; i += 1) toLibrary(game, "Wastes");
    game.state.zones.perPlayer[A].hand = [];
    game.state.zones.perPlayer[B].hand = [];
    toHand(game, "Wastes");
    toHand(game, "Wastes", B);
    attack(game, a, [worm], B);
    expect(hand(game, B).length).toBe(0);
    expect(graveyard(game, B).length).toBe(1);
    expect(hand(game).length).toBe(2);
  });

  it("For the Ancestors chooses a type, then reveals any of that type from six", () => {
    const { game, a } = table();
    for (let i = 0; i < 6; i += 1) toLibrary(game, "Wastes");
    const bears = toLibrary(game, "Grizzly Bears");
    a.chooseCreatureTypeFn = () => "Bear";
    a.chooseFromZoneFn = (_v, eligible) => (eligible.includes(bears) ? [bears] : []);
    spawn(game, "Forest");
    spawn(game, "Forest");
    spawn(game, "Forest");
    cast(game, toHand(game, "For the Ancestors"));
    expect(zone(game, bears)).toBe("hand");
  });
});
