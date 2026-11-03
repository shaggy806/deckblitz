/**
 * What an Aura says of the permanent it enchants, or of that permanent's
 * controller: `controlledBy: "monarch"` through `attachedTo` (Fall from Favor),
 * `blocksDespiteLandwalk` (Street Savvy, rule 702.14), and `hostOfSource` as a
 * cost modification's and a prohibition's filter (Power Artifact, Desert's Hold,
 * Detainment Spell), with the prevention beside it (Demonic Torment).
 */
import { describe, expect, it } from "vitest";
import { canBlock, combatCreatures } from "../bot/combat-math.js";
import { whyCannotBlock } from "../combat/eligibility.js";
import { restrictionsOf } from "../characteristics.js";
import type { Game } from "../game.js";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  lands,
  life,
  nextTurn,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  zone,
} from "./harness.js";

const enchant = (game: Game, aura: string, host: ObjectId, mana: string, n: number, player: PlayerId = A): ObjectId => {
  lands(game, mana, n, player);
  const card = toHand(game, aura, player);
  cast(game, card, { player, targets: [ref(host)] });
  return card;
};

describe("Fall from Favor", () => {
  it("taps it, makes you the monarch, and it stays tapped while its controller isn't the monarch", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    enchant(game, "Fall from Favor", bears, "Island", 3);
    expect(game.state.objects[bears].tapped).toBe(true);
    expect(game.state.monarch).toBe(A);

    nextTurn(game); // Bob's turn: Alice is the monarch.
    expect(game.state.turn.number).toBe(2);
    expect(game.state.objects[bears].tapped).toBe(true);
  });

  it("untaps once that player is the monarch", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    enchant(game, "Fall from Favor", bears, "Island", 3);
    nextTurn(game);
    game.debugApplyEffect(B, { kind: "become-monarch" }, []);
    nextTurn(game);
    nextTurn(game); // Bob's next untap step.
    expect(game.state.turn.number).toBe(4);
    expect(game.state.objects[bears].tapped).toBe(false);
  });

  it("asks about the creature's controller, not the Aura's: yours, with you the monarch, untaps", () => {
    const { game } = table();
    const bears = spawn(game, "Grizzly Bears", A);
    enchant(game, "Fall from Favor", bears, "Island", 3);
    expect(restrictionsOf(game.state, game.registry, bears).has("doesnt-untap")).toBe(false);
    game.debugApplyEffect(B, { kind: "become-monarch" }, []);
    expect(restrictionsOf(game.state, game.registry, bears).has("doesnt-untap")).toBe(true);
  });
});

describe("Street Savvy", () => {
  const faced = (walker: string, land: string) => {
    const t = table();
    const attacker = spawn(t.game, walker, A);
    lands(t.game, land, 1, B);
    const savvy = spawn(t.game, "Hill Giant", B);
    const other = spawn(t.game, "Grizzly Bears", B);
    enchant(t.game, "Street Savvy", savvy, "Forest", 1, A);
    t.a.declareAttackersFn = () => [{ attacker, defender: B }];
    t.game.advanceUntil((s) => s.awaiting?.kind === "blockers");
    return { ...t, attacker, savvy, other };
  };

  it("+0/+2, and that creature alone blocks a swampwalker", () => {
    const { game, attacker, savvy, other } = faced("Anaconda", "Swamp");
    expect(pt(game, savvy)).toEqual({ power: 3, toughness: 5 });
    expect(whyCannotBlock(game.state, game.registry, B, savvy, attacker)).toBeNull();
    expect(whyCannotBlock(game.state, game.registry, B, other, attacker)).toMatch(/swampwalk/);
  });

  it("every kind: a landwalk no keyword names too", () => {
    const { game, attacker, savvy, other } = faced("Dryad Sophisticate", "Bazaar of Baghdad");
    expect(whyCannotBlock(game.state, game.registry, B, savvy, attacker)).toBeNull();
    expect(whyCannotBlock(game.state, game.registry, B, other, attacker)).toMatch(/landwalk/);
  });

  it("the bots' block check agrees", () => {
    const { game, savvy, other } = faced("Anaconda", "Swamp");
    const [walker] = combatCreatures(game.state, game.registry, A, false).filter((c) => c.keywords.has("swampwalk"));
    const blockers = combatCreatures(game.state, game.registry, B, false);
    const of = (id: ObjectId) => blockers.find((c) => c.id === id)!;
    expect(canBlock(of(savvy), walker)).toBe(true);
    expect(canBlock(of(other), walker)).toBe(false);
  });
});

describe("Power Artifact", () => {
  it("takes {2} off the host's abilities and no other's", () => {
    const { game } = table();
    const host = spawn(game, "Basalt Monolith", A, { tapped: true });
    const other = spawn(game, "Basalt Monolith", A, { tapped: true });
    enchant(game, "Power Artifact", host, "Island", 2);
    lands(game, "Wastes", 1);
    expect(() => activate(game, other, 1)).toThrow();
    activate(game, host, 1); // {3} less 2 is {1}
    expect(game.state.objects[host].tapped).toBe(false);
  });

  it("can't reduce the mana in a cost below one", () => {
    const { game } = table();
    const stone = spawn(game, "Mind Stone", A);
    enchant(game, "Power Artifact", stone, "Island", 2);
    expect(() => activate(game, stone, 1)).toThrow(); // still {1}
    lands(game, "Wastes", 1);
    activate(game, stone, 1);
    expect(zone(game, stone)).toBe("graveyard");
  });
});

describe("Demonic Torment", () => {
  it("can't attack, and deals no combat damage", () => {
    const { game, a, b } = table();
    const giant = spawn(game, "Hill Giant", A);
    const dreadmaw = spawn(game, "Colossal Dreadmaw", B);
    enchant(game, "Demonic Torment", dreadmaw, "Swamp", 3);
    expect(restrictionsOf(game.state, game.registry, dreadmaw).has("cant-attack")).toBe(true);
    b.declareBlockersFn = () => [{ blocker: dreadmaw, attacker: giant }];
    attack(game, a, [giant]);
    expect(zone(game, giant)).toBe("battlefield");
    expect(game.state.objects[dreadmaw].damageMarked ?? 0).toBe(3);
  });
});

describe("Desert's Hold", () => {
  const hold = (setup: (game: Game) => void) => {
    const { game } = table();
    const host = spawn(game, "Prodigal Sorcerer", B);
    const other = spawn(game, "Prodigal Sorcerer", B);
    setup(game);
    const before = life(game, A);
    enchant(game, "Desert's Hold", host, "Plains", 3);
    return { game, host, other, gained: life(game, A) - before };
  };

  it("gains 3 with a Desert on your battlefield or in your graveyard, and only then", () => {
    expect(hold((game) => void spawn(game, "Shefet Dunes", A)).gained).toBe(3);
    expect(hold((game) => void toGraveyard(game, "Shefet Dunes", A)).gained).toBe(3);
    expect(hold(() => undefined).gained).toBe(0);
    expect(hold((game) => void spawn(game, "Shefet Dunes", B)).gained).toBe(0);
  });

  it("stops the host attacking, blocking and activating, and no other", () => {
    const { game } = table();
    const host = spawn(game, "Prodigal Sorcerer", A);
    const other = spawn(game, "Prodigal Sorcerer", A);
    enchant(game, "Desert's Hold", host, "Plains", 3);
    const restrictions = restrictionsOf(game.state, game.registry, host);
    expect(restrictions.has("cant-attack")).toBe(true);
    expect(restrictions.has("cant-block")).toBe(true);
    expect(() => activate(game, host, 0, { targets: [ref(B)] })).toThrow();
    expect(restrictionsOf(game.state, game.registry, other).has("cant-block")).toBe(false);
    const before = life(game, B);
    activate(game, other, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(before - 1);
  });
});

describe("Detainment Spell", () => {
  it("stops its host's abilities and moves for {1}{W}", () => {
    const { game } = table();
    const first = spawn(game, "Prodigal Sorcerer", A);
    const second = spawn(game, "Prodigal Sorcerer", A);
    const spell = enchant(game, "Detainment Spell", first, "Plains", 1);
    expect(() => activate(game, first, 0, { targets: [ref(B)] })).toThrow();

    lands(game, "Plains", 2);
    activate(game, spell, 0, { targets: [ref(second)] });
    expect(game.state.objects[spell].attachedTo).toBe(second);
    expect(() => activate(game, second, 0, { targets: [ref(B)] })).toThrow();
    const before = life(game, B);
    activate(game, first, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(before - 1);
  });
});
