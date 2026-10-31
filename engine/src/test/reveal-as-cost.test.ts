/**
 * Revealing cards from your hand as a cost (rule 701.20a) — `BeholdSpec`'s
 * `fromHand` without `exile`, asked as a `choose-from-zone` with the
 * `"reveal"` destination; the cards stay in the hand. Three shapes:
 *
 * - a branch of a choice of additional costs (rule 601.2b): Lorwyn's
 *   "reveal a Kithkin card from your hand or pay {3}" (Goldmeadow Stalwart,
 *   Silvergill Adept);
 * - an optional additional cost, the kicker `keyword: "reveal"`, whose bonus
 *   is also had by controlling a Dragon as the casting finishes
 *   (`kicker.orControls`) — but not by a copy (Draconic Roar, Orator of
 *   Ojutai, Scaleguard Sentinels);
 * - an activated ability's "Reveal X white cards from your hand"
 *   (`AbilityCost.reveal` — the Coldsnap Martyrs).
 */
import { describe, expect, it } from "vitest";

import type { LegalAction } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  counters,
  hand,
  lands,
  life,
  pickFromZone,
  pt,
  ref,
  spawn,
  table,
  toHand,
  zone,
} from "./harness.js";

const casts = (game: Game, card: ObjectId, player: PlayerId = A) =>
  game
    .legalActions(player)
    .filter((a): a is Extract<LegalAction, { kind: "cast-spell" }> => a.kind === "cast-spell" && a.card === card);

/** Every card revealed from a hand so far. */
const revealedFromHand = (game: Game): ObjectId[] =>
  game.state.eventLog.flatMap((e) => (e.type === "cards-revealed" && e.from === "hand" ? [...e.objects] : []));

describe("'reveal a Kithkin card from your hand or pay {3}' (Goldmeadow Stalwart, Silvergill Adept)", () => {
  it("the reveal is offered only with another matching card in hand: the spell can't reveal itself", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    const stalwart = toHand(game, "Goldmeadow Stalwart");
    toHand(game, "Savannah Lions");
    expect(casts(game, stalwart).map((c) => c.costOptionText)).toEqual(["Pay {3}"]);
    toHand(game, "Goldmeadow Stalwart");
    expect(casts(game, stalwart).map((c) => c.costOptionText)).toEqual(["Reveal a Kithkin card", "Pay {3}"]);
  });

  it("revealing costs no mana; the card picked is revealed to everyone and stays in hand", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    const stalwart = toHand(game, "Goldmeadow Stalwart");
    const first = toHand(game, "Goldmeadow Stalwart");
    const second = toHand(game, "Goldmeadow Stalwart");
    toHand(game, "Savannah Lions");
    const seen = pickFromZone(a, second);
    cast(game, stalwart, { costOption: 0 });
    expect([...seen.offered].sort()).toEqual([first, second].sort());
    expect(zone(game, stalwart)).toBe("battlefield");
    expect(revealedFromHand(game)).toEqual([second]);
    expect(zone(game, second)).toBe("hand");
  });

  it("the reveal is asked as a reveal, not a behold: no permanent is offered", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    spawn(game, "Goldmeadow Stalwart");
    const stalwart = toHand(game, "Goldmeadow Stalwart");
    toHand(game, "Goldmeadow Stalwart");
    toHand(game, "Goldmeadow Stalwart");
    let destination: string | undefined;
    a.chooseFromZoneFn = (_view, eligible, min) => {
      const awaiting = game.state.awaiting;
      if (awaiting?.kind === "choose-from-zone") destination = awaiting.destination;
      return eligible.slice(0, min);
    };
    cast(game, stalwart, { costOption: 0 });
    expect(destination).toBe("reveal");
    expect(game.legalActions(A).some((l) => l.kind === "choose-from-zone")).toBe(false);
  });

  it("paying {3} instead: Silvergill Adept enters and draws", () => {
    const { game } = table();
    lands(game, "Island", 5);
    const adept = toHand(game, "Silvergill Adept");
    const before = hand(game).length;
    cast(game, adept, { costOption: 1 });
    expect(zone(game, adept)).toBe("battlefield");
    expect(revealedFromHand(game)).toEqual([]);
    expect(hand(game).length).toBe(before - 1 + 1);
  });
});

describe("'you may reveal a Dragon card … if you revealed a Dragon card or controlled a Dragon' (Dragons of Tarkir)", () => {
  it("the revealing cast is offered only with a Dragon card in hand, labelled for it", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const roar = toHand(game, "Draconic Roar");
    spawn(game, "Grizzly Bears", B);
    expect(casts(game, roar).map((c) => c.kicked === true)).toEqual([false]);
    toHand(game, "Shivan Dragon");
    const kicked = casts(game, roar).find((c) => c.kicked === true);
    expect(kicked?.kickerKeyword).toBe("reveal");
    expect(kicked?.kickerCost).toBe("a Dragon card");
  });

  it("Draconic Roar revealed deals 3 to the creature's controller too; unrevealed, without a Dragon, not", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    const dragon = toHand(game, "Shivan Dragon");
    const first = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Draconic Roar"), { targets: [ref(first)], kicked: true });
    expect(zone(game, first)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
    expect(revealedFromHand(game)).toEqual([dragon]);
    expect(zone(game, dragon)).toBe("hand");
    const second = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Draconic Roar"), { targets: [ref(second)] });
    expect(zone(game, second)).toBe("graveyard");
    expect(life(game, B)).toBe(17);
  });

  it("controlling a Dragon as it's cast is enough without revealing — an opponent's Dragon isn't", () => {
    const { game } = table();
    lands(game, "Mountain", 4);
    spawn(game, "Shivan Dragon", B);
    const first = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Draconic Roar"), { targets: [ref(first)] });
    expect(life(game, B)).toBe(20);
    spawn(game, "Shivan Dragon");
    const second = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Draconic Roar"), { targets: [ref(second)] });
    expect(life(game, B)).toBe(17);
    expect(revealedFromHand(game)).toEqual([]);
  });

  it("a copy gets the bonus only if a Dragon card was revealed: the copy wasn't cast (the ruling)", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    lands(game, "Island", 2);
    spawn(game, "Shivan Dragon");
    const maw = spawn(game, "Colossal Dreadmaw", B);
    const roar = toHand(game, "Draconic Roar");
    cast(game, roar, { targets: [ref(maw)], settle: false });
    cast(game, toHand(game, "Twincast"), { targets: [ref(roar)] });
    // The copy: 3 to the Dreadmaw only. The original: 3 more, and 3 to B.
    expect(zone(game, maw)).toBe("graveyard");
    expect(life(game, B)).toBe(17);

    const { game: g2 } = table();
    lands(g2, "Mountain", 2);
    lands(g2, "Island", 2);
    toHand(g2, "Shivan Dragon");
    const maw2 = spawn(g2, "Colossal Dreadmaw", B);
    const roar2 = toHand(g2, "Draconic Roar");
    cast(g2, roar2, { targets: [ref(maw2)], kicked: true, settle: false });
    cast(g2, toHand(g2, "Twincast"), { targets: [ref(roar2)] });
    // Revealed: the copy deals 3 to B as well.
    expect(life(g2, B)).toBe(14);
  });

  it("on a permanent: Orator of Ojutai draws only with a Dragon; Scaleguard Sentinels gets its counter", () => {
    const { game } = table();
    lands(game, "Plains", 4);
    lands(game, "Forest", 2);
    const before = hand(game).length;
    cast(game, toHand(game, "Orator of Ojutai"));
    expect(hand(game).length).toBe(before);
    spawn(game, "Shivan Dragon");
    cast(game, toHand(game, "Orator of Ojutai"));
    expect(hand(game).length).toBe(before + 1);
    const sentinels = toHand(game, "Scaleguard Sentinels");
    cast(game, sentinels);
    expect(counters(game, sentinels, "+1/+1")).toBe(1);
    expect(pt(game, sentinels)).toEqual({ power: 3, toughness: 4 });
  });
});

describe("'Reveal X white cards from your hand' as an activated cost (the Coldsnap Martyrs)", () => {
  it("Martyr of Sands: X revealed white cards, chosen, stay in hand; three times X life", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    const martyr = spawn(game, "Martyr of Sands");
    const lions = toHand(game, "Savannah Lions");
    const swords = toHand(game, "Swords to Plowshares");
    toHand(game, "Savannah Lions");
    toHand(game, "Grizzly Bears");
    const seen = pickFromZone(a, lions, swords);
    activate(game, martyr, 0, { x: 2 });
    expect(seen.offered.length).toBe(3);
    expect(life(game)).toBe(26);
    expect(zone(game, martyr)).toBe("graveyard");
    expect(revealedFromHand(game).sort()).toEqual([lions, swords].sort());
    expect(zone(game, lions)).toBe("hand");
  });

  it("X is capped by the white cards in hand, and X = 0 asks nothing", () => {
    const { game } = table();
    lands(game, "Plains", 1);
    const martyr = spawn(game, "Martyr of Sands");
    toHand(game, "Savannah Lions");
    toHand(game, "Grizzly Bears");
    expect(() => activate(game, martyr, 0, { x: 2 })).toThrow();
    activate(game, martyr, 0, { x: 0 });
    expect(life(game)).toBe(20);
    expect(revealedFromHand(game)).toEqual([]);
  });

  it("Martyr of Spores: with exactly X green cards they're revealed unasked; +X/+X", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    const martyr = spawn(game, "Martyr of Spores");
    const bears = spawn(game, "Grizzly Bears");
    const elves = toHand(game, "Llanowar Elves");
    let asked = 0;
    a.chooseFromZoneFn = (_v, eligible, min) => {
      asked += 1;
      return eligible.slice(0, min);
    };
    activate(game, martyr, 0, { x: 1, targets: [ref(bears)] });
    expect(asked).toBe(0);
    expect(revealedFromHand(game)).toEqual([elves]);
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
  });

  it("Martyr of Ashes: X damage to each creature without flying", () => {
    const { game } = table();
    lands(game, "Mountain", 2);
    const martyr = spawn(game, "Martyr of Ashes");
    const elves = spawn(game, "Llanowar Elves", B);
    const dragon = spawn(game, "Shivan Dragon", B);
    toHand(game, "Lightning Bolt");
    activate(game, martyr, 0, { x: 1 });
    expect(zone(game, elves)).toBe("graveyard");
    expect(game.state.objects[dragon].damageMarked).toBe(0);
  });
});
