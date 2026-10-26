/**
 * Time Spiral (TSP), batch 1, group D.
 */
import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  cast,
  destroy,
  hand,
  lands,
  life,
  named,
  pt,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toStep,
  tokensNamed,
  zone,
} from "./harness.js";

describe("Basal Sliver", () => {
  it("gives an opponent's Sliver the sacrifice-for-{B}{B} ability, the mana going to its controller", () => {
    const { game } = table();
    spawn(game, "Basal Sliver");
    const theirs = spawn(game, "Watcher Sliver", B);
    game.advanceUntil((s) => s.priority.holder === B);
    activate(game, theirs, 0, { player: B, settle: false });
    expect(zone(game, theirs)).toBe("graveyard");
    expect(game.state.players[B].manaPool.map((u) => u.type)).toEqual(["B", "B"]);
  });
});

describe("Savage Thallid", () => {
  it("sacrifices a Saproling to regenerate a Fungus", () => {
    const { game } = table();
    const thallid = spawn(game, "Savage Thallid");
    const sap = spawn(game, "Saproling Token");
    game.dispatch({
      type: "activate-ability",
      player: A,
      source: thallid,
      abilityIndex: 1,
      targets: [ref(thallid)],
      sacrifice: sap,
    });
    settle(game);
    expect(tokensNamed(game, "Saproling Token", A)).toBe(0);
    destroy(game, thallid);
    expect(zone(game, thallid)).toBe("battlefield");
  });
});

describe("Wurmcalling", () => {
  it("makes an X/X Wurm and, with buyback, returns to hand", () => {
    const { game } = table();
    lands(game, "Forest", 7);
    const spell = toHand(game, "Wurmcalling");
    cast(game, spell, { x: 3, kicked: true });
    const [wurm] = named(game, "Wurm Token", A);
    expect(pt(game, wurm)).toEqual({ power: 3, toughness: 3 });
    expect(zone(game, spell)).toBe("hand");
  });
});

describe("Telekinetic Sliver", () => {
  it("lets an opponent's Sliver tap a permanent", () => {
    const { game } = table();
    spawn(game, "Telekinetic Sliver");
    const theirs = spawn(game, "Watcher Sliver", B);
    const bears = spawn(game, "Grizzly Bears");
    game.advanceUntil((s) => s.priority.holder === B);
    activate(game, theirs, 0, { player: B, targets: [ref(bears)] });
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.objects[theirs].tapped).toBe(true);
  });
});

describe("Mindlash Sliver", () => {
  it("makes each player discard a card", () => {
    const { game } = table();
    const sliver = spawn(game, "Mindlash Sliver");
    lands(game, "Swamp", 1);
    const mine = hand(game, A).length;
    const theirs = hand(game, B).length;
    activate(game, sliver, 0);
    expect(zone(game, sliver)).toBe("graveyard");
    expect(hand(game, A)).toHaveLength(mine - 1);
    expect(hand(game, B)).toHaveLength(theirs - 1);
  });
});

describe("Watcher Sliver", () => {
  it("gives every player's Sliver creatures +0/+2", () => {
    const { game } = table();
    spawn(game, "Watcher Sliver");
    const theirs = spawn(game, "Mindlash Sliver", B);
    expect(pt(game, theirs)).toEqual({ power: 1, toughness: 3 });
  });
});

describe("Liege of the Pit", () => {
  it("deals 7 damage to you at upkeep with no other creature to sacrifice", () => {
    const { game } = table();
    spawn(game, "Liege of the Pit");
    toStep(game, "draw");
    expect(life(game, A)).toBe(13);
  });
});

describe("Undying Rage", () => {
  it("returns to its owner's hand when the creature dies", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 3);
    const rage = toHand(game, "Undying Rage");
    cast(game, rage, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 4, toughness: 4 });
    destroy(game, bears);
    // State-based actions put the Aura into the graveyard once a player
    // would next get priority.
    toStep(game, "postcombat-main");
    expect(zone(game, rage)).toBe("hand");
  });
});
