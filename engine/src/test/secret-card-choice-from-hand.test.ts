import { describe, expect, it } from "vitest";

import { viewFor } from "../view.js";
import type { PlayerView } from "../view.js";
import { A, B, cast, controller, lands, pickFromZone, registryOf, table, toHand, zone } from "./harness.js";

// "Each player chooses a card in their hand. Then each player reveals their
// chosen card" (Stronghold Gambit): a hidden `look-and-choose` of each hand
// (`destination: "stay"`), then `reveal-hand` `only` the chosen cards, all
// after every choice; then `put-exiled-this-way-onto-battlefield` `revealed`
// reaches the cards still in the hands they were revealed from.
describe("a card chosen from each hand, revealed together (Stronghold Gambit)", () => {
  it("puts every revealed creature card of the lowest mana value onto the battlefield under its owner", () => {
    const { game, a, b } = table();
    lands(game, "Mountain", 2);
    const gambit = toHand(game, "Stronghold Gambit");
    const bears = toHand(game, "Grizzly Bears");
    toHand(game, "Hill Giant");
    const elf = toHand(game, "Elvish Visionary", B);
    const offeredToA = pickFromZone(a, bears);
    pickFromZone(b, elf);
    cast(game, gambit);
    expect(offeredToA.offered).toContain(bears);
    expect([zone(game, bears), zone(game, elf)]).toEqual(["battlefield", "battlefield"]);
    expect([controller(game, bears), controller(game, elf)]).toEqual([A, B]);
  });

  it("leaves a creature card of greater mana value, and a noncreature card, in hand", () => {
    const { game, a, b } = table();
    lands(game, "Mountain", 2);
    const gambit = toHand(game, "Stronghold Gambit");
    const giant = toHand(game, "Hill Giant");
    const bears = toHand(game, "Grizzly Bears", B);
    pickFromZone(a, giant);
    pickFromZone(b, bears);
    cast(game, gambit);
    expect([zone(game, giant), zone(game, bears)]).toEqual(["hand", "battlefield"]);
  });

  it("a noncreature card chosen does nothing; the lowest is read among creature cards only", () => {
    const { game, a, b } = table();
    lands(game, "Mountain", 2);
    const gambit = toHand(game, "Stronghold Gambit");
    const bolt = toHand(game, "Lightning Bolt");
    const giant = toHand(game, "Hill Giant", B);
    pickFromZone(a, bolt);
    pickFromZone(b, giant);
    cast(game, gambit);
    expect([zone(game, bolt), zone(game, giant)]).toEqual(["hand", "battlefield"]);
  });

  it("reveals nothing until every player has chosen", () => {
    const { game, a, b } = table();
    lands(game, "Mountain", 2);
    const gambit = toHand(game, "Stronghold Gambit");
    const bears = toHand(game, "Grizzly Bears");
    const giant = toHand(game, "Hill Giant", B);
    pickFromZone(a, bears);
    pickFromZone(b, giant);
    const from = game.state.eventLog.length;
    cast(game, gambit);
    const log = game.state.eventLog.slice(from);
    const chosen = log.flatMap((e, i) => (e.type === "cards-chosen-from-zone" ? [i] : []));
    const revealed = log.flatMap((e, i) => (e.type === "cards-revealed" ? [i] : []));
    expect(chosen.length).toBe(2);
    expect(revealed.length).toBe(2);
    expect(Math.min(...revealed)).toBeGreaterThan(Math.max(...chosen));
    // Only the chosen card of each hand, not the whole hand.
    expect(log.flatMap((e) => (e.type === "cards-revealed" ? e.objects : []))).toEqual([bears, giant]);
  });

  it("keeps a player's choice from every other seat until the reveal, then names both to everyone", () => {
    const { game, a, b } = table();
    lands(game, "Mountain", 2);
    const gambit = toHand(game, "Stronghold Gambit");
    const bears = toHand(game, "Grizzly Bears");
    toHand(game, "Shivan Dragon");
    const giant = toHand(game, "Hill Giant", B);
    pickFromZone(a, bears);
    const from = game.state.eventLog.length;
    // As Bob is asked (Alice has chosen), what Bob's seat is sent.
    let bobSaw: PlayerView | undefined;
    b.chooseFromZoneFn = (_view, eligible) => {
      // A copy: an unredacted view's `events` is the live log itself.
      bobSaw = structuredClone(viewFor(game.state, registryOf(game), B));
      return eligible.includes(giant) ? [giant] : [];
    };
    cast(game, gambit);
    expect(bobSaw).toBeDefined();
    const seen = bobSaw!;
    // Alice's hand is only face-down slots to Bob: no card of it is named.
    expect(seen.objects[bears]).toBeUndefined();
    expect(JSON.stringify(seen.objects)).not.toContain("Grizzly Bears");
    // Nor does any event say which of her cards she chose.
    const told = seen.events.slice(from);
    expect(told.some((e) => e.type === "cards-chosen-from-zone" && e.player === A)).toBe(true);
    expect(JSON.stringify(told)).not.toContain(`"${bears}"`);
    expect(told.some((e) => e.type === "cards-revealed")).toBe(false);
    // Revealed together: every seat now sees both chosen cards as revealed.
    for (const viewer of [A, B]) {
      const view = viewFor(game.state, registryOf(game), viewer);
      const revealed = view.events.slice(from).flatMap((e) => (e.type === "cards-revealed" ? e.objects : []));
      expect(revealed).toEqual([bears, giant]);
      // The Bears entered; the Giant stays in Bob's hand, revealed (still known to all).
      expect(view.objects[bears]?.cardName).toBe("Grizzly Bears");
      expect(view.objects[giant]?.cardName).toBe("Hill Giant");
    }
  });
});
