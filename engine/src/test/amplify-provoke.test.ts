/**
 * Amplify (rule 702.38a) and provoke (rule 702.39a), Legions' two keywords,
 * with the `block-if-able` effect provoke is built on: a blocking
 * requirement on one creature (rule 509.1c), "target creature blocks [this
 * creature] this turn if able".
 */
import { describe, expect, it } from "vitest";

import { blockingViolations, obeyingLure } from "../combat/blocking.js";
import {
  B,
  activate,
  attack,
  blockOffer,
  cast,
  counters,
  lands,
  life,
  pickFromZone,
  pickModes,
  pickTargets,
  pt,
  spawn,
  table,
  toHand,
} from "./harness.js";

describe("amplify", () => {
  it("Glowering Rogon: a counter for each Beast revealed; only cards sharing a type, never itself", () => {
    const { game, a } = table();
    const vorine = toHand(game, "Krosan Vorine");
    const throwback = toHand(game, "Feral Throwback");
    const changeling = toHand(game, "Changeling Outcast");
    const bears = toHand(game, "Grizzly Bears");
    const seen = pickFromZone(a, vorine, throwback);
    lands(game, "Forest", 6);
    const rogon = toHand(game, "Glowering Rogon");
    cast(game, rogon);
    expect(seen.offered).toEqual(expect.arrayContaining([vorine, throwback, changeling]));
    expect(seen.offered).not.toContain(bears);
    expect(seen.offered).not.toContain(rogon);
    expect(counters(game, rogon)).toBe(2);
    expect(pt(game, rogon)).toEqual({ power: 6, toughness: 6 });
    // Revealed, and kept.
    expect(game.state.objects[vorine].zone).toBe("hand");
  });

  it("Feral Throwback's amplify 2 is two counters a card; revealing none, none", () => {
    const { game, a } = table();
    const vorine = toHand(game, "Krosan Vorine");
    pickFromZone(a, vorine);
    lands(game, "Forest", 6);
    const throwback = toHand(game, "Feral Throwback");
    cast(game, throwback);
    expect(counters(game, throwback)).toBe(2);

    toHand(game, "Brontotherium");
    pickFromZone(a);
    const rogon = toHand(game, "Glowering Rogon");
    lands(game, "Forest", 6);
    cast(game, rogon);
    expect(counters(game, rogon)).toBe(0);
  });

  it("Kilnmouth Dragon: no Dragon in hand asks nothing, and its ability deals what its counters say", () => {
    const { game, a } = table();
    let asked = false;
    a.chooseFromZoneFn = () => {
      asked = true;
      return [];
    };
    lands(game, "Mountain", 7);
    const dragon = toHand(game, "Kilnmouth Dragon");
    cast(game, dragon);
    expect(asked).toBe(false);
    expect(counters(game, dragon)).toBe(0);
  });
});

describe("provoke", () => {
  it("Goblin Grappler untaps the creature, which then has to block it", () => {
    const { game, a } = table();
    const grappler = spawn(game, "Goblin Grappler");
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    const giant = spawn(game, "Hill Giant", B);
    pickTargets(a, bears);
    pickModes(a, 0);
    const offer = blockOffer(game, a, [grappler]);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(offer.blockRequirements).toEqual([{ blocker: bears, attacker: grappler }]);
    expect(() => game.dispatch({ type: "declare-blockers", player: B, blocks: [] })).toThrow(/must block if able/);
    // Another creature blocking it instead doesn't let the provoked one off.
    expect(
      blockingViolations([{ blocker: giant, attacker: grappler }], offer).map((v) => v.kind),
    ).toEqual(["block-requirement"]);
    // The fix-up the bots finish with puts it on the Grappler.
    expect(obeyingLure([], offer)).toEqual([{ blocker: bears, attacker: grappler }]);
    game.dispatch({ type: "declare-blockers", player: B, blocks: [{ blocker: bears, attacker: grappler }] });
    expect(game.state.objects[bears].blocking).toBe(grappler);
  });

  it("declining the may leaves the creature tapped and free", () => {
    const { game, a } = table();
    const grappler = spawn(game, "Goblin Grappler");
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    spawn(game, "Hill Giant", B);
    pickTargets(a, bears);
    pickModes(a);
    const offer = blockOffer(game, a, [grappler]);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(offer.blockRequirements).toBeUndefined();
    game.dispatch({ type: "declare-blockers", player: B, blocks: [] });
  });

  it("a creature that can't block the provoker is under no requirement (Swooping Talon's flying)", () => {
    const { game, a } = table();
    const talon = spawn(game, "Swooping Talon");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    pickModes(a, 0);
    // Nothing can block it, so bob isn't even asked, and it connects.
    attack(game, a, [talon]);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(game.state.objects[bears].blocking).toBeNull();
    expect(life(game, B)).toBe(18);
  });

  it("Swooping Talon, having lost its flying, can be made to be blocked", () => {
    const { game, a } = table();
    const talon = spawn(game, "Swooping Talon");
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Plains", 1);
    activate(game, talon, 0);
    pickTargets(a, bears);
    pickModes(a, 0);
    const offer = blockOffer(game, a, [talon]);
    expect(offer.blockRequirements).toEqual([{ blocker: bears, attacker: talon }]);
  });

  it("Hunter Sliver gives another Sliver provoke: the creature has to block that Sliver", () => {
    const { game, a } = table();
    spawn(game, "Hunter Sliver");
    const winged = spawn(game, "Sidewinder Sliver");
    const bears = spawn(game, "Grizzly Bears", B, { tapped: true });
    pickTargets(a, bears);
    pickModes(a, 0);
    const offer = blockOffer(game, a, [winged]);
    expect(game.state.objects[bears].tapped).toBe(false);
    expect(offer.blockRequirements).toEqual([{ blocker: bears, attacker: winged }]);
  });

  it("the requirement lasts the turn only, and a creature that left takes none with it", () => {
    const { game, a, b } = table();
    const grappler = spawn(game, "Goblin Grappler");
    const bears = spawn(game, "Grizzly Bears", B);
    pickTargets(a, bears);
    pickModes(a, 0);
    b.declareBlockersFn = () => [{ blocker: bears, attacker: grappler }];
    attack(game, a, [grappler]);
    expect(game.state.objects[grappler].zone).toBe("graveyard");
    expect(game.state.blockRequirements).toHaveLength(1);
    game.advanceUntil((s) => s.turn.number === 2);
    expect(game.state.blockRequirements).toBeUndefined();
  });
});
