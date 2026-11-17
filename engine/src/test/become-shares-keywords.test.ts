/**
 * "At the beginning of each upkeep, creatures you control gain flying until
 * end of turn if a creature you control has flying. The same is true for fear,
 * first strike, double strike, landwalk, protection, trample, and vigilance."
 * (Concerted Effort): a `become` with `sharesKeywords`, the one-shot form of a
 * static's `sharesKeywords` — the listed keywords, each landwalk (rule
 * 702.14a) and each protection ability (702.16a) among the creatures you
 * control, read once as it resolves (608.2h), granted ones counting, given to
 * the creatures you control then (611.2c) until end of turn.
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import { A, B, cast, destroy, keywords, lands, quiet, ref, registryOf, spawn, table, toHand, toStep, zone } from "./harness.js";

const protectionOf = (game: ReturnType<typeof table>["game"], id: string) =>
  computeCharacteristics(game.state, registryOf(game), id as never).protectionFrom;

describe("Concerted Effort", () => {
  it("gives each creature you control the keywords, landwalk and protection any of them has, and they stay when the source leaves", () => {
    const { game } = table();
    spawn(game, "Concerted Effort");
    spawn(game, "Serra Angel");
    const knight = spawn(game, "White Knight");
    spawn(game, "Bog Wraith");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(keywords(game, bears)).not.toContain("flying");
    toStep(game, "draw");
    expect([...keywords(game, bears)]).toEqual(
      expect.arrayContaining(["flying", "vigilance", "first-strike", "swampwalk"]),
    );
    expect(keywords(game, bears)).not.toContain("trample");
    expect([...protectionOf(game, bears).colors]).toEqual(["B"]);
    // Bob's creatures gain nothing.
    expect(keywords(game, theirs)).not.toContain("flying");
    // White Knight leaving takes nothing away (the ruling).
    destroy(game, knight);
    expect(zone(game, knight)).toBe("graveyard");
    expect(keywords(game, bears)).toContain("first-strike");
    // A black spell can't target it, whoever casts it.
    lands(game, "Swamp", 3);
    expect(() => cast(game, toHand(game, "Murder"), { targets: [ref(bears)] })).toThrow(/target/i);
  });

  it("is gone at end of turn, and a creature that arrives later gains nothing", () => {
    const { game } = table();
    spawn(game, "Concerted Effort");
    spawn(game, "Serra Angel");
    const bears = spawn(game, "Grizzly Bears");
    toStep(game, "draw");
    expect(keywords(game, bears)).toContain("flying");
    const late = spawn(game, "Grizzly Bears");
    expect(keywords(game, late)).not.toContain("flying");
    // Bob's upkeep, its trigger still on the stack: Alice's turn's grant is
    // over.
    toStep(game, "upkeep", B);
    expect(game.state.zones.shared.stack).toHaveLength(1);
    expect(keywords(game, bears)).not.toContain("flying");
    // It triggers in every upkeep, Bob's too.
    toStep(game, "draw", B);
    expect(keywords(game, bears)).toContain("flying");
    expect(keywords(game, late)).toContain("flying");
  });

  it("shares a granted protection and a landwalk no keyword names (nonbasic landwalk)", () => {
    const { game } = table();
    spawn(game, "Concerted Effort");
    const dryad = spawn(game, "Dryad Sophisticate");
    const bears = spawn(game, "Grizzly Bears");
    // Protection from green granted to the Dryad, until Alice's next turn is
    // under way: what it has as the trigger resolves is what's shared.
    game.debugApplyEffect(A, { kind: "grant-protection", target: 0, from: { colors: ["G"] }, duration: "permanent" }, [
      ref(dryad),
    ]);
    toStep(game, "draw");
    const c = computeCharacteristics(game.state, registryOf(game), bears);
    expect(c.landwalk).toEqual([{ type: "land", notSupertype: "basic" }]);
    expect(c.keywords.has("landwalk")).toBe(true);
    expect([...c.protectionFrom.colors]).toEqual(["G"]);
  });

  it("Odric, Lunarch Marshal shares skulk, and a 'hexproof from' as itself, not as hexproof", () => {
    const { game } = table();
    spawn(game, "Odric, Lunarch Marshal");
    spawn(game, "Knight of Grace");
    spawn(game, "Furtive Homunculus");
    const bears = spawn(game, "Grizzly Bears");
    game.advanceUntil((s) => s.turn.step === "begin-combat" && quiet(s));
    const c = computeCharacteristics(game.state, registryOf(game), bears);
    expect([...c.keywords]).toEqual(expect.arrayContaining(["first-strike", "skulk"]));
    expect(c.keywords.has("hexproof")).toBe(false);
    expect([...c.hexproofFrom.colors]).toEqual(["B"]);
  });

  it("shares nothing when no creature you control has any of it", () => {
    const { game } = table();
    spawn(game, "Concerted Effort");
    const bears = spawn(game, "Grizzly Bears");
    const before = game.state.objects[bears].modifiers.length;
    toStep(game, "draw");
    expect(game.state.objects[bears].modifiers.length).toBe(before);
    expect(protectionOf(game, bears).colors.size).toBe(0);
  });
});
