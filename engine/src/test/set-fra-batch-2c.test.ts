/**
 * Reality Fracture (FRA), batch 2, part c (2026-10-11): the set's next cards by EDHREC rank.
 * Written on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  C,
  activate,
  attack,
  cast,
  counters,
  enter,
  hand,
  keywords,
  lands,
  life,
  pickModes,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const jaceTokens = (game: Game, player = A): ObjectId[] =>
  game.state.zones.shared.battlefield.filter(
    (id) => game.state.objects[id].cardName === "Jace Token" && game.state.objects[id].controller === player,
  );

const dispatchOrThrow = (game: Game, action: Action): void => {
  const why = game.canDispatch(action);
  if (why !== null) throw new Error(why);
  game.dispatch(action);
};

describe("Way of the Cryomancer", () => {
  it("empowers Jace 5, and the granted −3 copies the next instant or sorcery you cast this turn", () => {
    const { game } = table();
    enter(game, "Way of the Cryomancer");
    const [jace] = jaceTokens(game);
    expect(counters(game, jace, "loyalty")).toBe(5);
    toStep(game, "postcombat-main");
    // The Jace token's two printed abilities come first; the granted one is third.
    activate(game, jace, 2);
    expect(counters(game, jace, "loyalty")).toBe(2);
    lands(game, "Island", 6);
    const before = hand(game).length;
    cast(game, toHand(game, "Divination"));
    // Divination and its copy drew two each.
    expect(hand(game).length).toBe(before + 4);
    // Only the next one.
    const after = hand(game).length;
    cast(game, toHand(game, "Divination"));
    expect(hand(game).length).toBe(after + 2);
  });

  it("gives the −3 to a nontoken planeswalker you control, not an opponent's", () => {
    const { game } = table();
    spawn(game, "Way of the Cryomancer");
    const mine = spawn(game, "Jace Beleren");
    const theirs = spawn(game, "Jace Beleren", B);
    const printed = game.registry.get("Jace Beleren").activated.length;
    const offered = (source: ObjectId): number[] =>
      game
        .legalActions(source === mine ? A : B)
        .flatMap((x) => (x.kind === "activate-ability" && x.source === source ? [x.abilityIndex] : []));
    // Jace Beleren starts at 3 loyalty: enough for the −3.
    expect(offered(mine)).toContain(printed);
    expect(game.state.objects[theirs].controller).toBe(B);
    // Bob's Jace has only its own printed abilities.
    expect(
      game.legalActions(B).some((x) => x.kind === "activate-ability" && x.source === theirs && x.abilityIndex >= printed),
    ).toBe(false);
  });
});

describe("Fatehold Annex (the planeswalker check lands)", () => {
  it("enters tapped without a planeswalker, untapped with one", () => {
    const { game } = table();
    const first = toHand(game, "Fatehold Annex");
    dispatchOrThrow(game, { type: "play-land", player: A, card: first });
    settle(game);
    expect(game.state.objects[first].tapped).toBe(true);
    // An opponent's planeswalker doesn't count.
    spawn(game, "Jace Beleren", B);
    const second = toHand(game, "Konstrari Annex");
    dispatchOrThrow(game, { type: "play-land", player: A, card: second });
    settle(game);
    expect(game.state.objects[second].tapped).toBe(true);
    spawn(game, "Jace Beleren");
    const third = toHand(game, "Meticulous Commons");
    dispatchOrThrow(game, { type: "play-land", player: A, card: third });
    settle(game);
    expect(game.state.objects[third].tapped).toBe(false);
  });
});

describe("Marwyn, the Preserver", () => {
  it("gives your lands hexproof, not an opponent's", () => {
    const { game } = table();
    spawn(game, "Marwyn, the Preserver");
    const mine = spawn(game, "Forest");
    const theirs = spawn(game, "Forest", B);
    expect(keywords(game, mine).has("hexproof")).toBe(true);
    expect(keywords(game, theirs).has("hexproof")).toBe(false);
  });

  it("returns a land card from your graveyard to your hand for {2}", () => {
    const { game } = table();
    const marwyn = spawn(game, "Marwyn, the Preserver");
    lands(game, "Wastes", 2);
    const land = toGraveyard(game, "Forest");
    activate(game, marwyn, 0, { targets: [ref(land)] });
    expect(zone(game, land)).toBe("hand");
  });
});

describe("Rewrite Regrets", () => {
  it("returns a planeswalker card of mana value 6 or less, then empowers Jace 2", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const beleren = toGraveyard(game, "Jace Beleren");
    cast(game, toHand(game, "Rewrite Regrets"), { targets: [ref(beleren)] });
    expect(zone(game, beleren)).toBe("battlefield");
    const [jace] = jaceTokens(game);
    expect(counters(game, jace, "loyalty")).toBe(2);
  });

  it("can't target a creature card of mana value 7 or more", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const hoof = toGraveyard(game, "Craterhoof Behemoth");
    expect(() => cast(game, toHand(game, "Rewrite Regrets"), { targets: [ref(hoof)] })).toThrow();
  });
});

describe("Stingcaster Mage", () => {
  it("gives an instant in your graveyard flashback at its mana cost", () => {
    const { game } = table();
    const shock = toGraveyard(game, "Shock");
    const mage = enter(game, "Stingcaster Mage");
    expect(keywords(game, mage).has("haste")).toBe(true);
    expect(game.state.objects[shock].grantedFlashback?.cost).toBe("{R}");
  });
});

describe("Master of Barbs", () => {
  it("pumps your creatures once per noncombat damage event to one or more opponents, from any source", () => {
    const { game } = table({ players: 3 });
    const master = spawn(game, "Master of Barbs");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    // Bob and Carol, dealt damage at once: one trigger.
    game.debugApplyEffect(A, { kind: "damage", amount: 1, who: "each-opponent" }, [], { source: bears });
    settle(game);
    expect(life(game, B)).toBe(19);
    expect(life(game, C)).toBe(19);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(pt(game, master)).toEqual({ power: 3, toughness: 1 });
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
    // Bob's source damaging Carol (and alice): Carol is an opponent.
    game.debugApplyEffect(B, { kind: "damage", amount: 1, who: "each-opponent" }, [], { source: theirs });
    settle(game);
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 2 });
  });

  it("doesn't trigger on damage to you, to a creature, or on combat damage", () => {
    const { game, a } = table();
    spawn(game, "Master of Barbs");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Shock"), { targets: [ref(A)] });
    cast(game, toHand(game, "Shock"), { targets: [ref(theirs)] });
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
    attack(game, a, [bears]);
    expect(life(game, B)).toBe(18);
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });
});

describe("Hungering Puppetbeast", () => {
  it("makes a Heartwood, then sacrifices another artifact for a counter and the chosen keyword", () => {
    const { game, a } = table();
    const beast = enter(game, "Hungering Puppetbeast");
    expect(tokensNamed(game, "Heartwood Token", A)).toBe(1);
    const heartwood = game.state.zones.shared.battlefield.find(
      (id) => game.state.objects[id].cardName === "Heartwood Token",
    )!;
    lands(game, "Wastes", 1);
    const offer = game
      .legalActions(A)
      .find((x) => x.kind === "activate-ability" && x.source === beast);
    expect(offer?.kind === "activate-ability" ? offer.sacrifice?.choices : undefined).toEqual([heartwood]);
    pickModes(a, 1);
    dispatchOrThrow(game, {
      type: "activate-ability",
      player: A,
      source: beast,
      abilityIndex: 0,
      targets: [],
      sacrifice: heartwood,
    });
    settle(game);
    expect(game.state.zones.shared.battlefield).not.toContain(heartwood);
    expect(counters(game, beast)).toBe(1);
    expect(pt(game, beast)).toEqual({ power: 6, toughness: 6 });
    const kw = keywords(game, beast);
    expect(kw.has("hexproof")).toBe(true);
    expect(kw.has("trample")).toBe(false);
    expect(kw.has("haste")).toBe(false);
  });
});

describe("Rise of the Deathbringer", () => {
  it("draws cards equal to your greatest power and loses that much life", () => {
    const { game } = table();
    spawn(game, "Hill Giant");
    spawn(game, "Grizzly Bears");
    spawn(game, "Craterhoof Behemoth", B);
    lands(game, "Swamp", 5);
    const before = hand(game).length;
    cast(game, toHand(game, "Rise of the Deathbringer"), { modes: [0] });
    expect(hand(game).length).toBe(before + 3);
    expect(life(game)).toBe(17);
  });

  it("loses life only for the cards actually drawn", () => {
    const { game } = table();
    spawn(game, "Hill Giant");
    lands(game, "Swamp", 5);
    const library = game.state.zones.perPlayer[A].library;
    library.splice(0, library.length - 2);
    cast(game, toHand(game, "Rise of the Deathbringer"), { modes: [0] });
    expect(life(game)).toBe(18);
  });

  it("gives all creatures -3/-3", () => {
    const { game } = table();
    const giant = spawn(game, "Hill Giant");
    const theirs = spawn(game, "Craterhoof Behemoth", B);
    lands(game, "Swamp", 5);
    cast(game, toHand(game, "Rise of the Deathbringer"), { modes: [1] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(pt(game, theirs)).toEqual({ power: 2, toughness: 2 });
  });
});
