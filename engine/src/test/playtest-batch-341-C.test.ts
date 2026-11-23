import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  graveyard,
  hand,
  keywords,
  lands,
  life,
  named,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  table,
  toExile,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

const library = (game: ReturnType<typeof table>["game"], player = A) => game.state.zones.perPlayer[player].library;

describe("playtest batch 341 — group C", () => {
  it("One with Death: its caster loses the game", () => {
    const { game } = table();
    lands(game, "Swamp", 1);
    cast(game, toHand(game, "One with Death"));
    expect(game.state.players[A].hasLost).toBe(true);
    expect(game.state.players[B].hasLost).not.toBe(true);
  });

  it("The Alright Henge: a nontoken creature entering under your control gets a counter", () => {
    const { game } = table();
    spawn(game, "The Alright Henge");
    const bears = enter(game, "Grizzly Bears");
    const theirs = enter(game, "Grizzly Bears", B);
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, theirs)).toBe(0);
  });

  it("Drop Bear: Forests plus Bears (itself among them), then fights", () => {
    const { game, a } = table();
    lands(game, "Forest", 2);
    const victim = spawn(game, "Grizzly Bears", B);
    pickTargets(a, victim);
    const bear = enter(game, "Drop Bear");
    expect(pt(game, bear)).toEqual({ power: 3, toughness: 3 });
    expect(zone(game, victim)).toBe("graveyard");
    expect(zone(game, bear)).toBe("battlefield");
  });

  it("Common Black Removal: the mill mode destroys, then mills the creature's last power", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const wurm = spawn(game, "Craw Wurm", B);
    const before = library(game, B).length;
    cast(game, toHand(game, "Common Black Removal"), { modes: [3], targets: [ref(wurm)] });
    expect(zone(game, wurm)).toBe("graveyard");
    expect(library(game, B).length).toBe(before - 6);
  });

  it("Sliv-Mizzet: every Sliver you control flies, taps to draw and pings on each draw", () => {
    const { game, a } = table();
    const sliv = spawn(game, "Sliv-Mizzet, Hivemind");
    const muscle = spawn(game, "Muscle Sliver");
    expect(keywords(game, muscle).has("flying")).toBe(true);
    pickTargets(a, B);
    const cards = hand(game).length;
    activate(game, sliv, 0);
    expect(hand(game).length).toBe(cards + 1);
    expect(life(game, B)).toBe(18);
  });

  it("Locus Cobra: a counter only for a Locus or Sphere land", () => {
    const { game } = table();
    const cobra = spawn(game, "Locus Cobra");
    enter(game, "Wastes");
    expect(counters(game, cobra)).toBe(0);
    enter(game, "Cloudpost");
    expect(counters(game, cobra)).toBe(1);
  });

  it("My Deck is About a Seven: the number is 6 to 8, dealt as damage", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    const wurm = spawn(game, "Craw Wurm", B);
    let offered: { min: number; max?: number } | undefined;
    a.chooseNumberFn = (_view, offer) => {
      offered = offer;
      return 6;
    };
    cast(game, toHand(game, "My Deck is About a Seven"), { targets: [ref(wurm)] });
    expect(offered).toMatchObject({ min: 6, max: 8 });
    expect(zone(game, wurm)).toBe("graveyard");
  });

  it("Dwarven Confluencer: the land's controller gets a Mana Confluence", () => {
    const { game } = table();
    const confluencer = spawn(game, "Dwarven Confluencer");
    const forest = spawn(game, "Forest", B);
    activate(game, confluencer, 0, { targets: [ref(forest)] });
    expect(zone(game, forest)).toBe("graveyard");
    expect(tokensNamed(game, "Mana Confluence Token", B)).toBe(1);
    expect(tokensNamed(game, "Mana Confluence Token", A)).toBe(0);
  });

  it("Ulgrotha Charm: Forget's mode discards two, then draws that many", () => {
    const { game } = table();
    lands(game, "Island", 3);
    const cards = hand(game, B).length;
    cast(game, toHand(game, "Ulgrotha Charm"), { modes: [2], targets: [ref(B)] });
    expect(graveyard(game, B).length).toBe(2);
    expect(hand(game, B).length).toBe(cards);
  });

  it("Processing Plant: a card put from exile untaps it; declining exiles each opponent's top card", () => {
    const { game, a } = table();
    const exiled = toExile(game, "Grizzly Bears", B);
    pickModes(a, 0);
    pickFromZone(a, exiled);
    const plant = enter(game, "Processing Plant");
    expect(zone(game, exiled)).toBe("graveyard");
    expect(game.state.objects[plant].tapped).toBe(false);

    pickModes(a);
    const top = library(game, B).length;
    const second = enter(game, "Processing Plant");
    expect(game.state.objects[second].tapped).toBe(true);
    expect(library(game, B).length).toBe(top - 1);
  });

  it("Arvad: combat damage to an opponent puts a legendary permanent from hand onto the battlefield", () => {
    const { game, a } = table();
    const arvad = spawn(game, "Arvad of the Weatherlight");
    const isamaru = toHand(game, "Isamaru, Hound of Konda");
    pickFromZone(a, isamaru);
    attack(game, a, [arvad]);
    expect(life(game, B)).toBe(17);
    expect(zone(game, isamaru)).toBe("battlefield");
  });

  it("The Bear Force Pilot Runner: its Vehicle gets +1/+1 for each Bear", () => {
    const { game } = table();
    enter(game, "The Bear Force Pilot Runner");
    spawn(game, "Grizzly Bears");
    const [vehicle] = named(game, "0/0 Flying Bear Vehicle Token");
    expect(pt(game, vehicle)).toEqual({ power: 2, toughness: 2 });
    expect(keywords(game, vehicle).has("flying")).toBe(true);
  });

  it("Lantern of Undersight: you draw from the bottom", () => {
    const { game } = table();
    spawn(game, "Lantern of Undersight");
    const top = toLibrary(game, "Grizzly Bears");
    lands(game, "Island", 3);
    const cards = hand(game).length;
    cast(game, toHand(game, "Divination"));
    expect(hand(game).length).toBe(cards + 2);
    expect(zone(game, top)).toBe("library");
  });

  it("Peel Out: a Fog and a Banana", () => {
    const { game } = table();
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Peel Out"));
    expect(tokensNamed(game, "Banana Token", A)).toBe(1);
  });

  it("Really Charming Prince: a charm is picked at random as it resolves", () => {
    const { game, a } = table();
    const offers: string[] = [];
    a.chooseCastNowFn = (_view, offer) => {
      offers.push(offer.casts[0].cardName);
      return null;
    };
    enter(game, "Really Charming Prince");
    expect(game.state.eventLog.some((e) => e.type === "chosen-at-random")).toBe(true);
    expect(offers).toHaveLength(1);
    expect(["Piracy Charm", "Sapphire Charm", "Trickery Charm", "Vision Charm"]).toContain(offers[0]);
  });
});
