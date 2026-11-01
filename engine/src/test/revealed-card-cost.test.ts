/**
 * "The revealed card": a card revealed from the hand to pay a cost (rule
 * 701.20a — a `fromHand` behold), remembered on the spell or ability it paid
 * for (`LastKnownRefs.revealed`) and read by its effect as the `"revealed"`
 * amount ref — in the hand while it's still there, and as it last existed
 * there once it has left (the rulings on Titan's Presence, Charge of the
 * Forever-Beast and Calamity of the Titans). And an activated ability's
 * "Reveal two cards from your hand that share a color" (Illuminated Folio —
 * `AbilityCost.reveal.shareColor`), the choice's `together` rule "share"
 * over each card's colours.
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
  hand,
  lands,
  pickFromZone,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

const castable = (game: Game, card: ObjectId): boolean =>
  game.legalActions(A).some((a) => a.kind === "cast-spell" && a.card === card);
const revealedFromHand = (game: Game): ObjectId[] =>
  game.state.eventLog.flatMap((e) => (e.type === "cards-revealed" && e.from === "hand" ? [...e.objects] : []));

describe("a mandatory reveal as an additional cost, and the revealed card's numbers", () => {
  it("Induce Despair: can't be cast without a creature card to reveal; -X/-X by its mana value", () => {
    const { game } = table();
    lands(game, "Swamp", 3);
    const despair = toHand(game, "Induce Despair");
    toHand(game, "Lightning Bolt");
    const wurm = spawn(game, "Craw Wurm", B);
    expect(castable(game, despair)).toBe(false);
    const dragon = toHand(game, "Shivan Dragon");
    expect(castable(game, despair)).toBe(true);
    cast(game, despair, { targets: [ref(wurm)] });
    expect(revealedFromHand(game)).toEqual([dragon]);
    expect(zone(game, dragon)).toBe("hand");
    expect(zone(game, wurm)).toBe("graveyard");
  });

  it("Charge of the Forever-Beast reads the card the player picked", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const charge = toHand(game, "Charge of the Forever-Beast");
    const bears = toHand(game, "Grizzly Bears");
    toHand(game, "Craw Wurm");
    const giant = spawn(game, "Hill Giant", B);
    pickFromZone(a, bears);
    cast(game, charge, { targets: [ref(giant)] });
    expect(revealedFromHand(game)).toEqual([bears]);
    expect(game.state.objects[giant].damageMarked).toBe(2);
  });

  it("a revealed card that has left the hand is read as it last existed there", () => {
    const { game, a } = table();
    lands(game, "Forest", 3);
    const charge = toHand(game, "Charge of the Forever-Beast");
    const bears = toHand(game, "Grizzly Bears");
    const wurm = spawn(game, "Craw Wurm", B);
    pickFromZone(a, bears);
    cast(game, charge, { targets: [ref(wurm)], settle: false });
    // In response the Bears go onto the battlefield and grow to 5/5.
    expect(game.debugMove(bears, "battlefield")).toBe(true);
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 3 }, [ref(bears)]);
    expect(pt(game, bears).power).toBe(5);
    settle(game);
    expect(zone(game, charge)).toBe("graveyard");
    // 2 damage, the Bears' power in the hand — not 5 (the Wurm has 4 toughness).
    expect(zone(game, wurm)).toBe("battlefield");
    expect(game.state.objects[wurm].damageMarked).toBe(2);
  });

  it("Calamity of the Titans: only a colorless creature card, and mana value less than it", () => {
    const { game } = table();
    lands(game, "Wastes", 6);
    const calamity = toHand(game, "Calamity of the Titans");
    toHand(game, "Grizzly Bears");
    expect(castable(game, calamity)).toBe(false);
    const engine = toHand(game, "Wurmcoil Engine");
    const bears = spawn(game, "Grizzly Bears", B);
    const jace = spawn(game, "Jace Beleren", B);
    const dragon = spawn(game, "Shivan Dragon", B);
    cast(game, calamity);
    expect(zone(game, engine)).toBe("hand");
    expect(zone(game, bears)).toBe("exile");
    expect(zone(game, jace)).toBe("exile");
    expect(zone(game, dragon)).toBe("battlefield");
  });

  it("Titan's Presence exiles only a creature with power at most the revealed card's", () => {
    const { game, a } = table();
    lands(game, "Wastes", 6);
    const presence = toHand(game, "Titan's Presence");
    const thopter = toHand(game, "Ornithopter");
    const engine = toHand(game, "Wurmcoil Engine");
    const bears = spawn(game, "Grizzly Bears", B);
    pickFromZone(a, thopter);
    cast(game, presence, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("battlefield");
    const again = toHand(game, "Titan's Presence");
    pickFromZone(a, engine);
    cast(game, again, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
  });
});

describe("Reveal two cards from your hand that share a color (Illuminated Folio)", () => {
  type ZoneOffer = Extract<LegalAction, { kind: "choose-from-zone" }>;

  it("isn't activatable without two cards sharing a colour; colourless shares none", () => {
    const { game } = table();
    lands(game, "Wastes", 1);
    const folio = spawn(game, "Illuminated Folio");
    toHand(game, "Lightning Bolt");
    toHand(game, "Counterspell");
    toHand(game, "Wastes");
    toHand(game, "Ornithopter");
    expect(game.legalActions(A).some((l) => l.kind === "activate-ability" && l.source === folio)).toBe(false);
    toHand(game, "Shock");
    expect(game.legalActions(A).some((l) => l.kind === "activate-ability" && l.source === folio)).toBe(true);
  });

  it("with only one pair, it's revealed unasked; the cards stay in hand", () => {
    const { game } = table();
    lands(game, "Wastes", 1);
    const folio = spawn(game, "Illuminated Folio");
    const bolt = toHand(game, "Lightning Bolt");
    const shock = toHand(game, "Shock");
    toHand(game, "Counterspell");
    const before = hand(game).length;
    activate(game, folio, 0);
    expect([...revealedFromHand(game)].sort()).toEqual([bolt, shock].sort());
    expect(hand(game).length).toBe(before + 1);
  });

  it("with a choice, a pair that shares no colour is refused", () => {
    const { game } = table();
    lands(game, "Wastes", 1);
    const folio = spawn(game, "Illuminated Folio");
    const bolt = toHand(game, "Lightning Bolt");
    const shock = toHand(game, "Shock");
    const counter = toHand(game, "Counterspell");
    toHand(game, "Counterspell");
    activate(game, folio, 0, { settle: false });
    const offer = game.legalActions(A).find((l): l is ZoneOffer => l.kind === "choose-from-zone");
    expect(offer?.together?.rule).toBe("share");
    expect(() => game.dispatch({ type: "choose-from-zone", player: A, chosen: [bolt, counter] })).toThrow(/share a color/);
    game.dispatch({ type: "choose-from-zone", player: A, chosen: [bolt, shock] });
    settle(game);
    expect([...revealedFromHand(game)].sort()).toEqual([bolt, shock].sort());
  });
});
