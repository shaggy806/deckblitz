/**
 * Tempest (TMP) — group D of the oldest-first set walk, the rest of the set (B181).
 */
import { describe, expect, it } from "vitest";

import type { Action } from "../actions.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  activate,
  cast,
  hand,
  keywords,
  lands,
  life,
  nextTurn,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

const WHITE_REFLECTION = "Reflection Token (White, 2/2)";

describe("Spirit Mirror", () => {
  it("makes a Reflection at your upkeep when there is none on the battlefield", () => {
    const { game } = table();
    spawn(game, "Spirit Mirror");
    toStep(game, "precombat-main", A);
    expect(tokensNamed(game, WHITE_REFLECTION, A)).toBe(1);
    toStep(game, "precombat-main", A);
    expect(tokensNamed(game, WHITE_REFLECTION, A)).toBe(1); // its own Reflection stops the next one
  });

  it("makes none while an opponent controls a Reflection token", () => {
    const { game } = table();
    spawn(game, "Spirit Mirror");
    game.debugApplyEffect(B, { kind: "create-token", token: "Reflection Token", count: 1 });
    expect(tokensNamed(game, "Reflection Token", B)).toBe(1);
    toStep(game, "precombat-main", A);
    expect(tokensNamed(game, WHITE_REFLECTION, A)).toBe(0);
  });

  it("{0}: destroys target Reflection", () => {
    const { game } = table();
    const mirror = spawn(game, "Spirit Mirror");
    const theirs = spawn(game, "Reflection Token", B);
    activate(game, mirror, 0, { targets: [ref(theirs)] });
    expect(tokensNamed(game, "Reflection Token", B)).toBe(0);
  });
});

describe("Excavator", () => {
  const excavate = (game: Game, excavator: ObjectId, land: ObjectId, target: ObjectId): void => {
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: excavator,
      abilityIndex: 0,
      targets: [ref(target)],
      sacrifice: land,
    } as Action);
    settle(game);
  };

  it("grants the landwalk of the sacrificed basic land's type", () => {
    const { game } = table();
    const excavator = spawn(game, "Excavator");
    const island = spawn(game, "Island");
    const bears = spawn(game, "Grizzly Bears");
    excavate(game, excavator, island, bears);
    expect(zone(game, island)).toBe("graveyard");
    expect(keywords(game, bears).has("islandwalk")).toBe(true);
    expect(keywords(game, bears).has("swampwalk")).toBe(false);
  });

  it("reads every land type the land had as it was sacrificed", () => {
    const { game } = table();
    spawn(game, "Urborg, Tomb of Yawgmoth");
    const excavator = spawn(game, "Excavator");
    const island = spawn(game, "Island");
    const bears = spawn(game, "Grizzly Bears");
    excavate(game, excavator, island, bears);
    expect(keywords(game, bears).has("islandwalk")).toBe(true);
    expect(keywords(game, bears).has("swampwalk")).toBe(true);
    expect(keywords(game, bears).has("forestwalk")).toBe(false);
  });
});

describe("Armor Sliver", () => {
  it("gives another Sliver a {2}: +0/+1 of its own", () => {
    const { game } = table();
    spawn(game, "Armor Sliver");
    const winged = spawn(game, "Winged Sliver");
    lands(game, "Plains", 2);
    activate(game, winged, 0);
    expect(pt(game, winged)).toEqual({ power: 1, toughness: 2 });
  });
});

describe("Kindle", () => {
  it("deals 2 plus the Kindles in every graveyard", () => {
    const { game } = table();
    toGraveyard(game, "Kindle", B);
    toGraveyard(game, "Kindle", A);
    lands(game, "Mountain", 2);
    const kindle = toHand(game, "Kindle");
    cast(game, kindle, { targets: [ref(B)] });
    expect(life(game, B)).toBe(16);
  });
});

describe("Scalding Tongs", () => {
  it("deals 1 to an opponent only with three or fewer cards in hand", () => {
    const { game } = table();
    spawn(game, "Scalding Tongs");
    toStep(game, "precombat-main", A);
    expect(life(game, B)).toBe(20); // a full hand
    for (const id of hand(game).slice(3)) game.debugMove(id, "graveyard");
    toStep(game, "draw", A); // the upkeep passed with three cards
    expect(life(game, B)).toBe(19);
  });
});

describe("Mogg Cannon", () => {
  it("pumps and grants flying, then destroys the creature at the end step", () => {
    const { game } = table();
    const cannon = spawn(game, "Mogg Cannon");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, cannon, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 2 });
    expect(keywords(game, bears).has("flying")).toBe(true);
    nextTurn(game);
    expect(zone(game, bears)).toBe("graveyard");
  });
});
