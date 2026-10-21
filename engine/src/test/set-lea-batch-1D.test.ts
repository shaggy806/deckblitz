/**
 * Limited Edition Alpha (LEA), batch 1, group D: Mind Twist, Deathgrip,
 * Animate Wall, Gloom, The Hive, Crystal Rod, Stone Giant and Tunnel.
 */
import { describe, expect, it } from "vitest";
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
  pickModes,
  pickTargets,
  pt,
  ref,
  spawn,
  toHand,
  tokensNamed,
  zone,
  table,
  graveyard,
} from "./harness.js";

const tappedCount = (game: Game, ids: readonly ObjectId[]): number => ids.filter((id) => game.state.objects[id].tapped).length;

describe("Mind Twist", () => {
  it("makes the target player discard X cards at random", () => {
    const { game } = table();
    lands(game, "Swamp", 4);
    const before = hand(game, B).length;
    const graveBefore = graveyard(game, B).length;
    cast(game, toHand(game, "Mind Twist"), { targets: [ref(B)], x: 3 });
    expect(hand(game, B).length).toBe(before - 3);
    expect(graveyard(game, B).length).toBe(graveBefore + 3);
  });
});

describe("Deathgrip", () => {
  it("counters a green spell", () => {
    const { game, a } = table();
    const deathgrip = spawn(game, "Deathgrip");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Forest", 1);
    lands(game, "Swamp", 2);
    pickTargets(a, bears);
    const growth = toHand(game, "Giant Growth");
    cast(game, growth, { targets: [ref(bears)], settle: false });
    activate(game, deathgrip, 0, { targets: [ref(growth)] });
    expect(zone(game, growth)).toBe("graveyard");
    expect(pt(game, bears)).toEqual({ power: 2, toughness: 2 });
  });

  it("can't target a spell that isn't green", () => {
    const { game } = table();
    const deathgrip = spawn(game, "Deathgrip");
    lands(game, "Mountain", 1);
    lands(game, "Swamp", 2);
    const shock = toHand(game, "Shock");
    cast(game, shock, { targets: [ref(B)], settle: false });
    expect(() => activate(game, deathgrip, 0, { targets: [ref(shock)] })).toThrow();
  });
});

describe("Animate Wall", () => {
  it("lets the enchanted Wall attack, and can enchant only a Wall", () => {
    const { game } = table();
    const wall = spawn(game, "Wall of Wood");
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Plains", 1);
    const aura = toHand(game, "Animate Wall");
    expect(() => cast(game, aura, { targets: [ref(bears)] })).toThrow();
    cast(game, aura, { targets: [ref(wall)] });
    expect(game.state.objects[aura].attachedTo).toBe(wall);
    game.advanceUntil((s) => s.awaiting?.kind === "attackers");
    const offer = game.legalActions(A).find((x) => x.kind === "declare-attackers");
    const eligible = offer?.kind === "declare-attackers" ? offer.eligible : [];
    expect(eligible).toContain(wall);
  });
});

describe("Gloom", () => {
  it("makes white spells cost {3} more", () => {
    const { game } = table();
    spawn(game, "Gloom", B);
    const plains = lands(game, "Plains", 6);
    cast(game, toHand(game, "Raise the Alarm"));
    expect(tappedCount(game, plains)).toBe(5);
  });

  it("makes activated abilities of white enchantments cost {3} more", () => {
    const { game } = table();
    spawn(game, "Gloom", B);
    const cop = spawn(game, "Circle of Protection: Red");
    const plains = lands(game, "Plains", 6);
    activate(game, cop, 0);
    expect(tappedCount(game, plains)).toBe(4);
  });
});

describe("The Hive", () => {
  it("makes a 1/1 flying Wasp", () => {
    const { game } = table();
    const hive = spawn(game, "The Hive");
    lands(game, "Wastes", 5);
    activate(game, hive, 0);
    expect(tokensNamed(game, "Wasp Token", A)).toBe(1);
    const wasp = game.battlefield.find((id) => game.state.objects[id].cardName === "Wasp Token")!;
    expect(pt(game, wasp)).toEqual({ power: 1, toughness: 1 });
    expect(keywords(game, wasp).has("flying")).toBe(true);
  });
});

describe("Crystal Rod", () => {
  it("lets you pay {1} to gain 1 life when a blue spell is cast", () => {
    const { game, a } = table();
    spawn(game, "Crystal Rod");
    lands(game, "Island", 1);
    const wastes = lands(game, "Wastes", 3);
    pickModes(a, 0);
    cast(game, toHand(game, "Divination"));
    expect(life(game, A)).toBe(21);
    expect(tappedCount(game, wastes)).toBe(3);
  });
});

describe("Stone Giant", () => {
  it("gives a smaller creature flying, then destroys it at the next end step", () => {
    const { game } = table();
    const giant = spawn(game, "Stone Giant");
    const wall = spawn(game, "Wall of Wood"); // toughness 3, not less than 3
    const bears = spawn(game, "Grizzly Bears");
    expect(() => activate(game, giant, 0, { targets: [ref(wall)] })).toThrow();
    activate(game, giant, 0, { targets: [ref(bears)] });
    expect(keywords(game, bears).has("flying")).toBe(true);
    expect(zone(game, bears)).toBe("battlefield");
    nextTurn(game);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("Tunnel", () => {
  it("destroys a Wall, which can't be regenerated, and only a Wall", () => {
    const { game } = table();
    const wall = spawn(game, "Wall of Wood", B);
    const bears = spawn(game, "Grizzly Bears", B);
    lands(game, "Mountain", 2);
    game.debugApplyEffect(B, { kind: "regenerate", target: 0 }, [ref(wall)]);
    expect(() => cast(game, toHand(game, "Tunnel"), { targets: [ref(bears)] })).toThrow();
    cast(game, toHand(game, "Tunnel"), { targets: [ref(wall)] });
    expect(zone(game, wall)).toBe("graveyard");
  });
});
