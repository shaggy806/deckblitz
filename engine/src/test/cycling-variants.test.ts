/**
 * Cycling's cost as a variant (rule 702.29): a cost that isn't mana ("Cycling—
 * Pay 2 life", "Cycling—Sacrifice a land"), an {X} in it that "when you cycle
 * this card" reads, and "you may pay {0} rather than pay cycling costs".
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  graveyard,
  hand,
  lands,
  life,
  named,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  watchTargets,
  zone,
} from "./harness.js";

type AbilityOffer = Extract<LegalAction, { kind: "activate-ability" }>;

const handOffers = (game: Game, card: ObjectId): readonly AbilityOffer[] =>
  game.legalActions(A).filter((a): a is AbilityOffer => a.kind === "activate-ability" && a.source === card);

const cycleOffer = (game: Game, card: ObjectId) =>
  game.legalActions(A).find((a) => a.kind === "cycle" && a.card === card);

const offerNamed = (game: Game, card: ObjectId, text: string): AbilityOffer => {
  const offer = handOffers(game, card).find((a) => a.text === text);
  if (offer === undefined) throw new Error(`no "${text}" offered: ${handOffers(game, card).map((a) => a.text).join(", ")}`);
  return offer;
};

describe("a cycling cost that isn't mana", () => {
  it("Street Wraith: pays 2 life, discards it and draws", () => {
    const { game } = table();
    const wraith = toHand(game, "Street Wraith");
    const before = hand(game).length;
    const offer = offerNamed(game, wraith, "Cycling—Pay 2 life");
    expect(cycleOffer(game, wraith)).toBeUndefined();
    activate(game, wraith, offer.abilityIndex);
    expect(life(game)).toBe(18);
    expect(zone(game, wraith)).toBe("graveyard");
    expect(hand(game).length).toBe(before); // discarded one, drew one
  });

  it("Street Wraith: not with less life than it costs (rule 118.3)", () => {
    const { game } = table({ life: 1 });
    const wraith = toHand(game, "Street Wraith");
    expect(handOffers(game, wraith)).toEqual([]);
    expect(() => game.dispatch({ type: "cycle", player: A, card: wraith })).toThrow();
  });

  it("is seen as cycling by 'whenever you cycle a card'", () => {
    const { game } = table();
    spawn(game, "Drannith Healer");
    const wraith = toHand(game, "Street Wraith");
    activate(game, wraith, offerNamed(game, wraith, "Cycling—Pay 2 life").abilityIndex);
    expect(life(game)).toBe(19); // 20 − 2 + the Healer's 1
  });

  it("Edge of Autumn: sacrifices the land chosen", () => {
    const { game } = table();
    const [land] = lands(game, "Wastes", 2);
    const edge = toHand(game, "Edge of Autumn");
    const offer = offerNamed(game, edge, "Cycling—Sacrifice a land");
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: edge,
      abilityIndex: offer.abilityIndex,
      targets: [],
      sacrifice: land,
    });
    settle(game);
    expect(zone(game, land)).toBe("graveyard");
    expect(zone(game, edge)).toBe("graveyard");
  });

  it("Edge of Autumn: not without a land to sacrifice", () => {
    const { game } = table();
    expect(handOffers(game, toHand(game, "Edge of Autumn"))).toEqual([]);
  });
});

describe("an X in a cycling cost", () => {
  it("Shark Typhoon: X is announced and the trigger's token is X/X", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const typhoon = toHand(game, "Shark Typhoon");
    const offer = offerNamed(game, typhoon, "Cycling {X}{1}{U}");
    expect(cycleOffer(game, typhoon)).toBeUndefined();
    expect(offer.xCost?.maxX).toBe(3);
    activate(game, typhoon, offer.abilityIndex, { x: 3 });
    const [shark] = named(game, "Shark Token (Shark Typhoon)");
    expect(pt(game, shark)).toEqual({ power: 3, toughness: 3 });
    expect(zone(game, typhoon)).toBe("graveyard");
  });

  it("Shark Typhoon: cycled for X = 0, the 0/0 Shark dies at once", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const typhoon = toHand(game, "Shark Typhoon");
    activate(game, typhoon, offerNamed(game, typhoon, "Cycling {X}{1}{U}").abilityIndex, { x: 0 });
    expect(named(game, "Shark Token (Shark Typhoon)")).toEqual([]);
  });

  it("Shark Typhoon: on the battlefield, a noncreature spell's mana value makes the Shark", () => {
    const { game } = table();
    spawn(game, "Shark Typhoon");
    lands(game, "Wastes", 2);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Divination"));
    const [shark] = named(game, "Shark Token (Shark Typhoon)");
    expect(pt(game, shark)).toEqual({ power: 3, toughness: 3 });
  });

  it("Webstrike Elite: targets only the mana value X cycled for, and may decline", () => {
    const { game, a } = table();
    lands(game, "Forest", 4);
    const two = spawn(game, "Mind Stone", B);
    const one = spawn(game, "Sol Ring", B);
    const elite = toHand(game, "Webstrike Elite");
    const watch = watchTargets(a, () => [two]);
    activate(game, elite, offerNamed(game, elite, "Cycling {X}{G}{G}").abilityIndex, { x: 2 });
    expect(watch.offered[0]).toContain(two);
    expect(watch.offered[0]).not.toContain(one);
    expect(zone(game, two)).toBe("graveyard");
    expect(zone(game, one)).toBe("battlefield");
  });

  it("Rampaging War Mammoth: up to X targets, X read as it triggers", () => {
    const { game, a } = table();
    lands(game, "Mountain", 5);
    const artifacts = [spawn(game, "Mind Stone", B), spawn(game, "Mind Stone", B), spawn(game, "Mind Stone", B)];
    const mammoth = toHand(game, "Rampaging War Mammoth");
    pickTargets(a, artifacts[0], artifacts[1]);
    activate(game, mammoth, offerNamed(game, mammoth, "Cycling {X}{2}{R}").abilityIndex, { x: 2 });
    expect(zone(game, artifacts[0])).toBe("graveyard");
    expect(zone(game, artifacts[1])).toBe("graveyard");
    expect(zone(game, artifacts[2])).toBe("battlefield");
  });

  it("Rampaging War Mammoth: a third target is too many at X = 2", () => {
    const { game, a } = table();
    lands(game, "Mountain", 5);
    const artifacts = [spawn(game, "Mind Stone", B), spawn(game, "Mind Stone", B), spawn(game, "Mind Stone", B)];
    const mammoth = toHand(game, "Rampaging War Mammoth");
    a.chooseTargetsFn = () => artifacts.map((id) => ref(id));
    expect(() =>
      activate(game, mammoth, offerNamed(game, mammoth, "Cycling {X}{2}{R}").abilityIndex, { x: 2 }),
    ).toThrow();
  });
});

describe("paying {0} rather than cycling costs", () => {
  it("New Perspectives: only with seven or more cards in hand", () => {
    const { game } = table();
    spawn(game, "New Perspectives");
    // The table's hand is eight by now: play three for six with this one.
    for (const land of hand(game).slice(0, 3)) game.dispatch({ type: "play-land", player: A, card: land });
    const card = toHand(game, "Startling Development");
    expect(hand(game).length).toBe(6);
    expect(handOffers(game, card)).toEqual([]);
    toHand(game, "Wastes");
    expect(hand(game).length).toBe(7);
    const offer = offerNamed(game, card, "Cycling {0}");
    // The printed cost is still there to pay instead.
    activate(game, card, offer.abilityIndex);
    expect(zone(game, card)).toBe("graveyard");
    expect(hand(game).length).toBe(7); // discarded one, drew one
  });

  it("New Perspectives: X is 0, and a non-mana cost goes unpaid, but the discard doesn't", () => {
    const { game } = table();
    spawn(game, "New Perspectives");
    const typhoon = toHand(game, "Shark Typhoon");
    const wraith = toHand(game, "Street Wraith");
    activate(game, wraith, offerNamed(game, wraith, "Cycling {0}").abilityIndex);
    expect(life(game)).toBe(20);
    expect(graveyard(game)).toContain(wraith);
    activate(game, typhoon, offerNamed(game, typhoon, "Cycling {0}").abilityIndex);
    expect(graveyard(game)).toContain(typhoon);
    expect(named(game, "Shark Token (Shark Typhoon)")).toEqual([]);
  });

  it("New Perspectives: a typecycling cost is a cycling cost (rule 702.29f)", () => {
    const { game } = table();
    spawn(game, "New Perspectives");
    const card = toHand(game, "Ash Barrens");
    expect(handOffers(game, card).some((a) => a.text === "Typecycling {0}")).toBe(true);
  });

  it("Gavi, Nest Warden: the first card each turn only, the next at its printed cost", () => {
    const { game } = table();
    spawn(game, "Gavi, Nest Warden");
    const first = toHand(game, "Startling Development");
    const second = toHand(game, "Startling Development");
    activate(game, first, offerNamed(game, first, "Cycling {0}").abilityIndex);
    expect(zone(game, first)).toBe("graveyard");
    expect(handOffers(game, second)).toEqual([]);
  });

  it("Gavi, Nest Warden: a card cycled before it arrived was the first", () => {
    const { game } = table();
    const wraith = toHand(game, "Street Wraith");
    activate(game, wraith, offerNamed(game, wraith, "Cycling—Pay 2 life").abilityIndex);
    spawn(game, "Gavi, Nest Warden");
    const next = toHand(game, "Street Wraith");
    expect(handOffers(game, next).map((a) => a.text)).toEqual(["Cycling—Pay 2 life"]);
  });

  it("Gavi, Nest Warden: a second card drawn makes a Dinosaur Cat", () => {
    const { game } = table();
    spawn(game, "Gavi, Nest Warden");
    lands(game, "Wastes", 2);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Divination"));
    expect(named(game, "Dinosaur Cat Token").length).toBe(1);
  });

  it("only its controller's hand", () => {
    const { game } = table();
    spawn(game, "Gavi, Nest Warden", B);
    expect(handOffers(game, toHand(game, "Startling Development"))).toEqual([]);
  });
});
