/**
 * Battles (rule 310) and Sieges (310.12): defense counters, a protector
 * chosen as it enters, attacking one (its protector defends it), damage
 * removing defense counters, and "when the last defense counter is removed,
 * exile it, then you may cast it transformed". Written from the rules and
 * the Sieges' rulings.
 */
import { describe, expect, it } from "vitest";

import { legalDefenders } from "../combat/eligibility.js";
import type { ObjectId } from "../primitives.js";
import {
  A,
  B,
  C,
  cast,
  counters,
  lands,
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

  it("damage from a spell (any target) removes defense counters too", () => {
    const { game } = table();
    const battle = invade(game);
    lands(game, "Mountain", 1);
    cast(game, toHand(game, "Lightning Bolt"), { targets: [ref(battle)] });
    expect(counters(game, battle, "defense")).toBe(2);
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
});
