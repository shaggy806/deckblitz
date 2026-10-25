/**
 * Tribute (rule 702.104): "As this creature enters, choose an opponent. That
 * player may put an additional N +1/+1 counters on it as it enters" — asked
 * as it's about to enter, its controller choosing the opponent (among two or
 * more), then that opponent answering — and the "if tribute wasn't paid"
 * trigger it carries (702.104b). Written from the rules and Born of the Gods'
 * tribute rulings.
 */
import { describe, expect, it } from "vitest";

import { A, B, C, cast, counters, keywords, lands, life, ref, settle, table, toHand, tokensNamed, zone } from "./harness.js";

const DECLINE = (_view: unknown, _source: unknown, options: readonly string[]): string => options[1];

describe("tribute (rule 702.104)", () => {
  it("paid: it enters with the counters, and the trigger doesn't happen", () => {
    const { game, a, b } = table();
    lands(game, "Mountain", 5);
    let asked: readonly string[] = [];
    b.chooseCreatureTypeFn = (_view, _source, options) => {
      asked = options;
      return options[0];
    };
    a.chooseCreatureTypeFn = () => {
      throw new Error("with one opponent, its controller isn't asked to choose");
    };
    const giant = toHand(game, "Pharagax Giant");
    cast(game, giant);
    expect(asked).toEqual(["Put 2 +1/+1 counters on it", "Don't"]);
    expect(counters(game, giant)).toBe(2);
    expect(life(game, B)).toBe(20);
  });

  it("unpaid: no counters, and the trigger happens (Pharagax Giant's 5 damage)", () => {
    const { game, b } = table();
    lands(game, "Mountain", 5);
    b.chooseCreatureTypeFn = DECLINE;
    const giant = toHand(game, "Pharagax Giant");
    cast(game, giant);
    expect(counters(game, giant)).toBe(0);
    expect(life(game, B)).toBe(15);
    expect(life(game, A)).toBe(20);
  });

  it("an unpaid trigger on the creature itself: Thunder Brute gains haste", () => {
    const { game, b } = table();
    lands(game, "Mountain", 6);
    b.chooseCreatureTypeFn = DECLINE;
    const brute = toHand(game, "Thunder Brute");
    cast(game, brute);
    expect(keywords(game, brute).has("haste")).toBe(true);
    expect(counters(game, brute)).toBe(0);
  });

  it("with several opponents its controller chooses one, and only that player answers", () => {
    const { game, a, b, c } = table({ players: 3 });
    lands(game, "Mountain", 5);
    let offered: readonly string[] = [];
    a.chooseCreatureTypeFn = (_view, _source, options) => {
      offered = options;
      return C;
    };
    b.chooseCreatureTypeFn = () => {
      throw new Error("the opponent not chosen isn't asked");
    };
    c.chooseCreatureTypeFn = DECLINE;
    const giant = toHand(game, "Pharagax Giant");
    cast(game, giant);
    expect(offered).toEqual([B, C]);
    expect(counters(game, giant)).toBe(0);
    // "Each opponent": both, whoever declined.
    expect(life(game, B)).toBe(15);
    expect(life(game, C)).toBe(15);
  });

  it("the unpaid trigger still resolves once the creature has left (the ruling)", () => {
    const { game, b } = table();
    lands(game, "Plains", 5);
    b.chooseCreatureTypeFn = DECLINE;
    const archon = toHand(game, "Ornitharch");
    cast(game, archon, { settle: false });
    // Resolve the creature spell, then destroy it with its trigger on the stack.
    game.advanceUntil((s) => s.objects[archon].zone === "battlefield" && s.zones.shared.stack.length === 1);
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(archon)]);
    settle(game);
    expect(zone(game, archon)).toBe("graveyard");
    expect(tokensNamed(game, "Bird Token", A)).toBe(2);
  });
});
