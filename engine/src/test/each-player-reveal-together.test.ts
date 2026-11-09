/**
 * "Each player reveals the top cards of their library, puts all [cards] onto
 * the battlefield, and exiles the rest" (Clear the Land, Over the Top): one
 * entry for every player's cards (rule 603.6a), written with `choicesHeld`.
 * `simultaneous` can't be: a `look-and-choose` asks, and a `simultaneous` loop
 * doesn't stop for answers, so the pool may not say it.
 */
import { describe, expect, it } from "vitest";
import { POOL_CARDS } from "../cards/generated.js";
import { A, B, cast, lands, table, toHand, toLibrary, zone } from "./harness.js";

describe("each player reveals and puts together (Clear the Land)", () => {
  it("every player's lands enter tapped as one event, the rest exiled", () => {
    const { game, b } = table({ deck: "Grizzly Bears" });
    const mine = toLibrary(game, "Wastes", A);
    const theirs = toLibrary(game, "Wastes", B);
    const library = game.state.zones.perPlayer;
    const before = [library[A].library.length, library[B].library.length];
    let aliceWaiting = "";
    const answer = b.chooseFromZoneFn;
    b.chooseFromZoneFn = (view, eligible, min, max) => {
      aliceWaiting = zone(game, mine);
      return answer(view, eligible, min, max);
    };
    const seq = game.state.eventSeq;
    lands(game, "Forest", 3);
    cast(game, toHand(game, "Clear the Land"));
    // Alice has answered, and her land waits for Bob's.
    expect(aliceWaiting).toBe("library");
    for (const land of [mine, theirs]) {
      expect(zone(game, land)).toBe("battlefield");
      expect(game.state.objects[land].tapped).toBe(true);
    }
    expect(library[A].library.length).toBe(before[0] - 5);
    expect(library[B].library.length).toBe(before[1] - 5);
    expect(Object.values(game.state.objects).filter((o) => o.zone === "exile").length).toBe(8);
    const entered = game.state.eventLog.filter((e) => e.seq >= seq && e.type === "permanent-entered-battlefield");
    expect(entered.length).toBe(2);
    expect(entered[1].seq - entered[0].seq).toBe(1);
  });
});

describe("a simultaneous for-each-player doesn't ask", () => {
  it("no pool card puts a look-and-choose inside one", () => {
    const asks = (node: unknown): boolean =>
      typeof node === "object" &&
      node !== null &&
      ((node as { kind?: unknown }).kind === "look-and-choose" || Object.values(node).some(asks));
    const offending: string[] = [];
    const walk = (node: unknown, name: string): void => {
      if (typeof node !== "object" || node === null) return;
      const n = node as { kind?: unknown; simultaneous?: unknown; effect?: unknown };
      if (n.kind === "for-each-player" && n.simultaneous === true && asks(n.effect)) offending.push(name);
      for (const child of Object.values(node)) walk(child, name);
    };
    for (const card of POOL_CARDS) walk(card, card.name);
    expect(offending).toEqual([]);
  });
});
