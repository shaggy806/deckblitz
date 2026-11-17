/**
 * "Exile any number of [historic] cards from your graveyard with total mana
 * value N or greater" as an activated ability's cost
 * (`AbilityCost.collectEvidence`'s record: `{ totalManaValue, filter }`): the
 * payment collect evidence makes (rule 701.59a), over the matching cards only,
 * chosen as the cost is paid (602.2b, 601.2h), and no evidence collected — The
 * Capitoline Triad.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  graveyard,
  hand,
  lands,
  life,
  pickFromZone,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  tokensNamed,
  zone,
} from "./harness.js";

const offered = (game: Game, source: ObjectId): boolean =>
  game.legalActions(A).some((l) => l.kind === "activate-ability" && l.source === source);

describe("exile cards with total mana value N or greater, as a cost", () => {
  it("counts only the matching cards: 29 of historic mana value isn't 30", () => {
    const { game } = table();
    const triad = spawn(game, "The Capitoline Triad");
    toGraveyard(game, "Ulamog, the Ceaseless Hunger"); // 10, legendary
    toGraveyard(game, "Kozilek, the Great Distortion"); // 10, legendary
    toGraveyard(game, "Platinum Emperion"); // 8, an artifact
    toGraveyard(game, "Sol Ring"); // 1, an artifact
    toGraveyard(game, "Void Winnower"); // 9, not historic
    expect(offered(game, triad)).toBe(false);
    toGraveyard(game, "Sol Ring");
    expect(offered(game, triad)).toBe(true);
  });

  it("exiles the chosen cards and makes the emblem; it collects no evidence", () => {
    const { game, a } = table();
    const triad = spawn(game, "The Capitoline Triad");
    const bear = spawn(game, "Grizzly Bears");
    spawn(game, "Surveillance Monitor"); // "Whenever you collect evidence, create a Thopter"
    const ulamog = toGraveyard(game, "Ulamog, the Ceaseless Hunger");
    const kozilek = toGraveyard(game, "Kozilek, the Great Distortion");
    const emperion = toGraveyard(game, "Platinum Emperion");
    const battlesphere = toGraveyard(game, "Myr Battlesphere"); // 7
    const ring = toGraveyard(game, "Sol Ring");
    const winnower = toGraveyard(game, "Void Winnower");
    const seen = pickFromZone(a, ulamog, kozilek, emperion, battlesphere);
    activate(game, triad);
    settle(game);
    expect(seen.offered).not.toContain(winnower);
    expect(seen.offered).toContain(ring);
    for (const id of [ulamog, kozilek, emperion, battlesphere]) expect(game.state.objects[id].zone).toBe("exile");
    expect(game.state.objects[ring].zone).toBe("graveyard");
    expect(game.state.objects[winnower].zone).toBe("graveyard");
    expect(tokensNamed(game, "Thopter Token", A)).toBe(0);
    expect(game.state.emblems).toHaveLength(1);
    expect(pt(game, bear)).toEqual({ power: 9, toughness: 9 });
    expect(pt(game, triad)).toEqual({ power: 9, toughness: 9 });
  });

  it("refuses a choice whose total falls short", () => {
    const { game } = table();
    const triad = spawn(game, "The Capitoline Triad");
    const ulamog = toGraveyard(game, "Ulamog, the Ceaseless Hunger");
    const kozilek = toGraveyard(game, "Kozilek, the Great Distortion");
    toGraveyard(game, "Platinum Emperion");
    toGraveyard(game, "Myr Battlesphere");
    activate(game, triad, 0, { settle: false });
    expect(game.state.awaiting?.kind).toBe("choose-from-zone");
    // 20 isn't 30.
    expect(() => game.dispatch({ type: "choose-from-zone", player: A, chosen: [ulamog, kozilek] })).toThrow();
    expect(game.state.objects[ulamog].zone).toBe("graveyard");
  });
});

describe("exile cards with N or more mana symbols of a color among their mana costs, as a cost (Baron Helmut Zemo)", () => {
  /** A's Zemo, having attacked this turn, with these cards in A's graveyard. */
  function zemoAttacked(names: readonly string[]) {
    const t = table();
    const zemo = spawn(t.game, "Baron Helmut Zemo");
    const cards = names.map((name) => toGraveyard(t.game, name));
    attack(t.game, t.a, [zemo]);
    return { ...t, zemo, cards };
  }

  it("counts black symbols, a hybrid or Phyrexian one once: 14 isn't 15", () => {
    // 2+2+2+2 (Sign in Blood) + 3 (Necropotence) + 2 (Dismember's {B/P}{B/P}) + 1 ({B/G}).
    const { game, zemo } = zemoAttacked([
      "Sign in Blood",
      "Sign in Blood",
      "Sign in Blood",
      "Sign in Blood",
      "Necropotence",
      "Dismember",
      "Deathrite Shaman",
      "Lightning Bolt",
    ]);
    expect(offered(game, zemo)).toBe(false);
    expect(game.canDispatch({ type: "activate-ability", player: A, source: zemo, abilityIndex: 0, targets: [] })).toMatch(
      /15 black mana symbols/,
    );
    toGraveyard(game, "Deathrite Shaman");
    expect(offered(game, zemo)).toBe(true);
  });

  it("can't boast before it attacks", () => {
    const { game } = table();
    const zemo = spawn(game, "Baron Helmut Zemo");
    for (let i = 0; i < 8; i += 1) toGraveyard(game, "Sign in Blood");
    expect(offered(game, zemo)).toBe(false);
  });

  it("exiles the chosen cards, copies them, and casts up to three copies free", () => {
    const { game, a, zemo, cards } = zemoAttacked([
      "Sign in Blood",
      "Sign in Blood",
      "Sign in Blood",
      "Sign in Blood",
      "Sign in Blood",
      "Necropotence",
      "Dismember",
    ]);
    for (let i = 0; i < 6; i += 1) toLibrary(game, "Swamp", B);
    const seen = pickFromZone(a, ...cards);
    const offers: number[] = [];
    a.chooseCastNowFn = (_view, offer) => {
      offers.push(offer.casts.length);
      const way = offer.casts.find((c) => c.cardName === "Sign in Blood");
      if (way === undefined) return null;
      return { type: "cast-spell", player: A, card: way.card, via: "effect", free: true, targets: [ref(B)] };
    };
    const handBefore = hand(game, B).length;
    activate(game, zemo);
    settle(game);
    expect(seen.offered).toHaveLength(7);
    // Three copies cast, none a fourth: Bob draws six and loses 6 (and 3
    // more to Zemo's attack, as the game settles on through combat).
    expect(offers).toHaveLength(3);
    expect(life(game, B)).toBe(20 - 6 - 3);
    expect(hand(game, B)).toHaveLength(handBefore + 6);
    // The cards themselves stay exiled; no copy is left anywhere.
    for (const id of cards) expect(zone(game, id)).toBe("exile");
    expect(game.state.zones.shared.exile).toHaveLength(7);
    expect(game.state.zones.shared.stack).toHaveLength(0);
  });

  it("refuses a choice short of fifteen", () => {
    const { game, zemo, cards } = zemoAttacked(["Necropotence", "Necropotence", "Necropotence", "Necropotence", "Necropotence"]);
    activate(game, zemo, 0, { settle: false });
    expect(game.state.awaiting?.kind).toBe("choose-from-zone");
    expect(() => game.dispatch({ type: "choose-from-zone", player: A, chosen: cards.slice(0, 4) })).toThrow();
    game.dispatch({ type: "choose-from-zone", player: A, chosen: cards });
    expect(zone(game, cards[0])).toBe("exile");
  });

  it("connives when its controller casts a black spell from hand, not a red one", () => {
    const { game, a } = table();
    const zemo = spawn(game, "Baron Helmut Zemo");
    lands(game, "Swamp", 2);
    lands(game, "Mountain", 1);
    const bears = toLibrary(game, "Grizzly Bears");
    const bolt = toHand(game, "Lightning Bolt");
    a.chooseDiscardsFn = () => [bears];
    cast(game, bolt, { targets: [ref(B)] });
    expect(counters(game, zemo)).toBe(0);
    expect(zone(game, bears)).toBe("library");
    cast(game, toHand(game, "Sign in Blood"), { targets: [ref(B)] });
    // Drew the Bears and discarded it, a nonland card: a +1/+1 counter.
    expect(counters(game, zemo)).toBe(1);
    expect(graveyard(game)).toContain(bears);
  });
});

describe("The Capitoline Triad's cost", () => {
  it("is {1} less for each historic card in your graveyard", () => {
    const { game } = table();
    lands(game, "Island", 7);
    toGraveyard(game, "Sol Ring");
    toGraveyard(game, "Ulamog, the Ceaseless Hunger");
    toGraveyard(game, "Void Winnower"); // not historic
    const triad = toHand(game, "The Capitoline Triad");
    expect(() => cast(game, triad)).toThrow();
    toGraveyard(game, "Platinum Emperion");
    cast(game, triad);
    expect(game.state.objects[triad].zone).toBe("battlefield");
  });
});
