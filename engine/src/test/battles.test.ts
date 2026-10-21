/**
 * Battles (rule 310) and Sieges (310.12): defense counters, a protector
 * chosen as it enters, attacking one (its protector defends it), damage
 * removing defense counters, and "when the last defense counter is removed,
 * exile it, then you may cast it transformed". Written from the rules and
 * the Sieges' rulings.
 */
import { describe, expect, it } from "vitest";

import { legalDefenders } from "../combat/eligibility.js";
import { matchesFilter } from "../filter.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  C,
  attack,
  cast,
  counters,
  hand,
  lands,
  life,
  tokensNamed,
  pickModes,
  pt,
  ref,
  spawn,
  table,
  toHand,
  types,
  zone,
} from "./harness.js";

function invade(game: Parameters<typeof lands>[0]): ObjectId {
  lands(game, "Swamp", 3);
  lands(game, "Forest", 3);
  const battle = toHand(game, "Invasion of Lorwyn");
  cast(game, battle);
  return battle;
}

describe("a Siege entering", () => {
  it("enters with its defense in defense counters, protected by the opponent its controller chose", () => {
    const { game, a } = table({ players: 3 });
    a.chooseCreatureTypeFn = (_view, _source, options) => {
      expect(options).toEqual([B, C]);
      return C;
    };
    const battle = invade(game);
    expect(zone(game, battle)).toBe("battlefield");
    expect(counters(game, battle, "defense")).toBe(5);
    expect(game.state.objects[battle].protector).toBe(C);
  });

  it("with one opponent, it's protected by them without asking", () => {
    const { game } = table();
    const battle = invade(game);
    expect(game.state.objects[battle].protector).toBe(B);
  });

  it("its enters ability works: destroys a non-Elf creature with power up to your lands", () => {
    const { game, a } = table();
    const bears = spawn(game, "Grizzly Bears", B);
    a.chooseTargetsFn = () => [ref(bears)];
    invade(game);
    expect(zone(game, bears)).toBe("graveyard");
  });
});

describe("attacking a battle you protect", () => {
  // Its protector is the defending player (rule 508.5), so Kazuul's "if
  // you're the defending player" fires — but the battle is neither "you" nor
  // "a planeswalker you control", so those triggers don't.
  function board(at: "battle" | "player") {
    const { game, a } = table();
    const battle = invade(game);
    spawn(game, "Kazuul, Tyrant of the Cliffs", B);
    spawn(game, "Marchesa's Decree", B);
    spawn(game, "Ever-Watching Threshold", B);
    const wurm = spawn(game, "Craw Wurm");
    const before = { life: life(game, A), hand: hand(game, B).length };
    attack(game, a, [wurm], at === "battle" ? battle : B);
    return {
      ogres: tokensNamed(game, "Ogre Token", B),
      lifeLost: before.life - life(game, A),
      drawn: hand(game, B).length - before.hand,
    };
  }

  it("fires Kazuul, but not Marchesa's Decree or Ever-Watching Threshold", () => {
    expect(board("battle")).toEqual({ ogres: 1, lifeLost: 0, drawn: 0 });
  });

  it("attacking its protector instead fires all three", () => {
    expect(board("player")).toEqual({ ogres: 1, lifeLost: 1, drawn: 1 });
  });
});

describe("attacking a battle", () => {
  it("its controller may attack it (its protector is an opponent); its protector may not", () => {
    const { game } = table();
    const battle = invade(game);
    expect(legalDefenders(game.state, game.registry, A)).toContain(battle);
    expect(legalDefenders(game.state, game.registry, B)).not.toContain(battle);
  });

  it("combat damage removes defense counters; the last one exiles it and casts it transformed", () => {
    const { game, a } = table();
    const battle = invade(game);
    const giant = spawn(game, "Craw Wurm");
    pickModes(a, 0);
    a.chooseCastNowFn = (_view, offer) => {
      const way = offer.casts[0];
      if (way === undefined) return null;
      return {
        type: "cast-spell",
        player: A,
        card: way.card,
        targets: [],
        via: way.via,
        ...(way.face !== undefined ? { face: way.face } : {}),
        ...(offer.free ? { free: true } : {}),
      };
    };
    a.declareAttackersFn = () => [{ attacker: giant, defender: battle }];
    game.advanceUntil((s) => s.turn.step === "postcombat-main" && s.zones.shared.stack.length === 0 && s.awaiting === null);
    // Craw Wurm's 6 takes all five; the Siege's ability exiles it and casts
    // Winnowing Forces for free.
    expect(zone(game, battle)).toBe("battlefield");
    expect(game.state.objects[battle].face).toBe(1);
    expect(types(game, battle)).toContain("creature");
    expect(pt(game, battle)).toEqual({ power: 6, toughness: 6 });
    expect(game.state.objects[battle].controller).toBe(A);
  });

  it("'deals combat damage to a player or battle' triggers on damage to a battle (Furnace Reins)", () => {
    const { game, a } = table();
    const battle = invade(game);
    const bears = spawn(game, "Grizzly Bears");
    lands(game, "Mountain", 3);
    cast(game, toHand(game, "Furnace Reins"), { targets: [ref(bears)] });
    a.declareAttackersFn = () => [{ attacker: bears, defender: battle }];
    game.advanceUntil((s) => s.turn.step === "postcombat-main" && s.zones.shared.stack.length === 0 && s.awaiting === null);
    expect(counters(game, battle, "defense")).toBe(3);
    const treasures = Object.values(game.state.objects).filter(
      (o) => o.zone === "battlefield" && o.cardName === "Treasure Token" && o.controller === A,
    );
    expect(treasures.length).toBe(1);
  });

  it("damage from a spell (any target) removes defense counters too", () => {
    const { game } = table();
    const battle = invade(game);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(battle)] });
    expect(counters(game, battle, "defense")).toBe(2);
  });
});

describe("filters and excess damage over battles", () => {
  it("protectedBy reads the protector from the filtering player's side", () => {
    const { game } = table();
    const battle = invade(game);
    const ok = (you: typeof A, filter: Parameters<typeof matchesFilter>[3]) =>
      matchesFilter(game.state, game.registry, battle, filter, { you });
    expect(ok(A, { type: "battle", protectedBy: "opponent" })).toBe(true);
    expect(ok(A, { type: "battle", protectedBy: "you" })).toBe(false);
    expect(ok(B, { type: "battle", protectedBy: "you" })).toBe(true);
    const bears = spawn(game, "Grizzly Bears", B);
    expect(matchesFilter(game.state, game.registry, bears, { protectedBy: "you" }, { you: B })).toBe(false);
  });

  it("attackingBattle tells a creature attacking a battle from one attacking a player", () => {
    const { game, a } = table();
    const battle = invade(game);
    const wurm = spawn(game, "Craw Wurm");
    const bears = spawn(game, "Grizzly Bears");
    a.declareAttackersFn = () => [
      { attacker: wurm, defender: battle },
      { attacker: bears, defender: B },
    ];
    game.advanceUntil((s) => s.turn.step === "declare-blockers");
    expect(matchesFilter(game.state, game.registry, wurm, { attackingBattle: true }, { you: A })).toBe(true);
    expect(matchesFilter(game.state, game.registry, bears, { attackingBattle: true }, { you: A })).toBe(false);
  });

  it("damage past a battle's defense is excess (rule 120.4a)", () => {
    const { game } = table();
    const battle = invade(game);
    lands(game, "Mountain", 2);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(battle)] });
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(battle)] });
    const hits = game
      .eventsOfType("damage-dealt")
      .filter((e) => e.target.kind === "object" && e.target.object === battle);
    expect(hits.map((e) => e.excess ?? 0)).toEqual([0, 1]);
  });
});

describe("a battle's protector", () => {
  it("one who leaves the game is replaced by the only opponent left (rule 310.11)", () => {
    const { game, a } = table({ players: 3 });
    a.chooseCreatureTypeFn = () => B;
    const battle = invade(game);
    expect(game.state.objects[battle].protector).toBe(B);
    game.state.players[B].life = 0;
    game.advanceUntil((s) => s.players[B].hasLost);
    game.advanceUntil((s) => s.awaiting === null && s.zones.shared.stack.length === 0);
    expect(game.state.objects[battle].protector).toBe(C);
  });

  it("one whose controller left the game too stays inert: nobody is asked (rule 800.4a)", () => {
    // A fuzzer game (seed 11) stalled when a battle's controller and its
    // protector lost at once: the left player was asked for a new protector.
    const { game, a } = table({ players: 4 });
    a.chooseCreatureTypeFn = () => B;
    const battle = invade(game);
    expect(game.state.objects[battle].protector).toBe(B);
    game.state.players[A].life = 0;
    game.state.players[B].life = 0;
    game.advanceUntil((s) => s.players[A].hasLost && s.players[B].hasLost);
    game.advanceUntil((s) => s.turn.number > 2);
    expect(game.state.awaiting?.player).not.toBe(A);
    expect(game.state.objects[battle].controller).toBe(A);
  });
});
