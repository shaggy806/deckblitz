/**
 * Separating objects into two piles and choosing one (rule 700.3) — the
 * `separate-into-piles` effect and its `separate-piles` / `choose-pile`
 * decisions: Fact or Fiction (revealed cards, an opponent separates),
 * Curator of Destinies (a face-down pile the chooser can't see), Liliana of
 * the Veil (permanents, sacrificed), Death or Glory (graveyard cards, one
 * pile exiled and the other returned).
 */

import { describe, expect, it } from "vitest";
import type { ChoosePileOffer, ControllerView, SeparatePilesOffer } from "../controller.js";
import type { ObjectId } from "../primitives.js";
import { viewFor } from "../view.js";
import {
  A,
  B,
  cast,
  graveyard,
  hand,
  lands,
  loyalty,
  registryOf,
  spawn,
  table,
  toGraveyard,
  toHand,
  toLibrary,
  zone,
  enter,
} from "./harness.js";

/** Five named cards on top of alice's library, the first on top. */
function topFive(game: Parameters<typeof toLibrary>[0]): ObjectId[] {
  const names = ["Grizzly Bears", "Shock", "Island", "Counterspell", "Llanowar Elves"];
  // `toLibrary` puts each on top, so the last put is the top card.
  return [...names].reverse().map((name) => toLibrary(game, name)).reverse();
}

describe("Fact or Fiction", () => {
  it("reveals the top five, the opponent separates them, and you choose the pile for your hand", () => {
    const { game, a, b } = table();
    const cards = topFive(game);
    lands(game, "Island", 4);
    let separating: SeparatePilesOffer | undefined;
    let choosing: ChoosePileOffer | undefined;
    b.separatePilesFn = (_view, offer) => {
      separating = offer;
      return [cards.slice(0, 2), cards.slice(2)];
    };
    a.choosePileFn = (_view, offer) => {
      choosing = offer;
      return 1;
    };
    cast(game, toHand(game, "Fact or Fiction"));
    expect(separating?.objects).toEqual(cards);
    expect(separating?.chooser).toBe(A);
    expect(separating?.fates).toEqual({ chosen: "hand", rest: "graveyard" });
    expect(choosing?.piles).toEqual([cards.slice(0, 2), cards.slice(2)]);
    expect(choosing?.separator).toBe(B);
    // Revealed to everyone (rule 701.16), so both seats saw them.
    expect(game.state.revealedThisTurn).toEqual(expect.arrayContaining(cards));
    for (const id of cards.slice(2)) expect(hand(game)).toContain(id);
    for (const id of cards.slice(0, 2)) expect(graveyard(game)).toContain(id);
    expect(game.state.eventLog.some((e) => e.type === "pile-chosen" && e.player === A && e.pile === 1)).toBe(true);
  });

  it("an empty pile is a pile (rule 700.3d): all five can go one way", () => {
    const { game, a, b } = table();
    const cards = topFive(game);
    lands(game, "Island", 4);
    b.separatePilesFn = () => [[], cards];
    a.choosePileFn = () => 0;
    cast(game, toHand(game, "Fact or Fiction"));
    for (const id of cards) expect(zone(game, id)).toBe("graveyard");
  });

  it("the bots split to deny the chooser and choose the better pile", () => {
    const { game } = table();
    const cards = topFive(game);
    lands(game, "Island", 4);
    const before = hand(game).length;
    cast(game, toHand(game, "Fact or Fiction"));
    const kept = cards.filter((id) => zone(game, id) === "hand");
    const binned = cards.filter((id) => zone(game, id) === "graveyard");
    expect(kept.length + binned.length).toBe(5);
    expect(hand(game).length).toBe(before + kept.length);
    // A split against the chooser leaves neither pile empty here.
    expect(kept.length).toBeGreaterThan(0);
    expect(binned.length).toBeGreaterThan(0);
  });

  it("refuses a separation that isn't two piles of every card exactly once", () => {
    const { game, b } = table();
    const cards = topFive(game);
    lands(game, "Island", 4);
    b.separatePilesFn = () => {
      throw new Error("asked");
    };
    cast(game, toHand(game, "Fact or Fiction"), { settle: false });
    game.advanceUntil((s) => s.awaiting?.kind === "separate-piles");
    const bad = [
      [cards.slice(0, 2), cards.slice(1)],
      [cards.slice(0, 2), cards.slice(3)],
      [cards.slice(0, 1), cards.slice(1, 3), cards.slice(3)],
    ];
    for (const piles of bad) expect(game.canDispatch({ type: "separate-piles", player: B, piles })).not.toBeNull();
    expect(game.canDispatch({ type: "separate-piles", player: A, piles: [[], cards] })).not.toBeNull();
    expect(game.canDispatch({ type: "separate-piles", player: B, piles: [[], cards] })).toBeNull();
  });

  it("asks nothing with an empty library", () => {
    const { game, b } = table();
    game.state.zones.perPlayer[A].library = [];
    lands(game, "Island", 4);
    b.separatePilesFn = () => {
      throw new Error("asked");
    };
    cast(game, toHand(game, "Fact or Fiction"));
    expect(game.state.awaiting).toBeNull();
  });
});

describe("Curator of Destinies", () => {
  it("you separate into a face-down and a face-up pile; the opponent chooses without seeing the face-down one", () => {
    const { game, a, b } = table();
    const cards = topFive(game);
    a.separatePilesFn = (_view, offer) => {
      expect(offer.faceDown).toBe(true);
      return [cards.slice(0, 1), cards.slice(1)];
    };
    let bobSees: { faceDown: boolean; faceUp: boolean } | undefined;
    let offered: ChoosePileOffer | undefined;
    b.choosePileFn = (view: ControllerView, offer) => {
      offered = offer;
      const seen = viewFor(view.state, registryOf(game), B);
      bobSees = {
        faceDown: seen.objects[cards[0]] !== undefined,
        faceUp: cards.slice(1).every((id) => seen.objects[id] !== undefined),
      };
      return 0;
    };
    enter(game, "Curator of Destinies");
    expect(bobSees).toEqual({ faceDown: false, faceUp: true });
    // The face-down card is worth nothing Bob can read off his offer.
    expect(offered?.worth[cards[0]]).toBeUndefined();
    expect(zone(game, cards[0])).toBe("hand");
    for (const id of cards.slice(1)) expect(zone(game, id)).toBe("graveyard");
    // Only the face-up pile was revealed.
    expect(game.state.revealedThisTurn).not.toContain(cards[0]);
  });
});

describe("Liliana of the Veil", () => {
  it("−6: you separate the target player's permanents; they sacrifice the pile they choose", () => {
    const { game, a, b } = table();
    const liliana = spawn(game, "Liliana of the Veil");
    const bears = spawn(game, "Grizzly Bears", B);
    const elves = spawn(game, "Llanowar Elves", B);
    const island = spawn(game, "Island", B);
    const mine = spawn(game, "Grizzly Bears", A);
    let objects: readonly ObjectId[] = [];
    a.separatePilesFn = (_view, offer) => {
      objects = offer.objects;
      return [[bears], [elves, island]];
    };
    b.choosePileFn = (_view, offer) => {
      expect(offer.fates).toEqual({ chosen: "lose" });
      return 0;
    };
    loyalty(game, liliana, -6, { atLeast: 6, targets: [{ kind: "player", player: B }] });
    expect([...objects].sort()).toEqual([bears, elves, island].sort());
    expect(zone(game, bears)).toBe("graveyard");
    expect(zone(game, elves)).toBe("battlefield");
    expect(zone(game, island)).toBe("battlefield");
    expect(zone(game, mine)).toBe("battlefield");
    expect(game.state.eventLog.some((e) => e.type === "permanent-sacrificed" && e.object === bears && e.player === B)).toBe(true);
  });

  it("−6: the bot chooses the pile that costs it less", () => {
    const { game, a } = table();
    const liliana = spawn(game, "Liliana of the Veil");
    const big = spawn(game, "Craw Wurm", B);
    const small = spawn(game, "Llanowar Elves", B);
    a.separatePilesFn = () => [[big], [small]];
    loyalty(game, liliana, -6, { atLeast: 6, targets: [{ kind: "player", player: B }] });
    expect(zone(game, big)).toBe("battlefield");
    expect(zone(game, small)).toBe("graveyard");
  });
});

describe("Death or Glory", () => {
  it("the opponent's choice is exiled and the other pile returns to the battlefield under your control", () => {
    const { game, a, b } = table();
    const bears = toGraveyard(game, "Grizzly Bears");
    const wurm = toGraveyard(game, "Craw Wurm");
    const shock = toGraveyard(game, "Shock");
    lands(game, "Plains", 5);
    a.separatePilesFn = (_view, offer) => {
      expect([...offer.objects].sort()).toEqual([bears, wurm].sort());
      return [[bears], [wurm]];
    };
    b.choosePileFn = () => 1;
    cast(game, toHand(game, "Death or Glory"));
    expect(zone(game, wurm)).toBe("exile");
    expect(zone(game, bears)).toBe("battlefield");
    expect(game.state.objects[bears].controller).toBe(A);
    expect(zone(game, shock)).toBe("graveyard");
  });
});
