/**
 * Engine rules gaps closed 2026-10-25 (`docs/engine-gaps.md`), each with the
 * card that shows it. Written from the Comprehensive Rules and the cards'
 * rulings, on the shared table in `harness.ts`.
 */
import { describe, expect, it } from "vitest";

import type { Game } from "../game.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  graveyard,
  lands,
  life,
  nextTurn,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toHand,
  tokensNamed,
  zone,
} from "./harness.js";

/** Advance to the first combat damage step with something on the stack, and
 * say how many abilities are there. */
function damageTriggers(game: Game): number {
  game.advanceUntil((s) => s.turn.step === "combat-damage" && s.zones.shared.stack.length > 0);
  return game.state.zones.shared.stack.length;
}

describe("a granted ability's dynamic target filter reads the creature that has it", () => {
  it("Firja's Retribution: an Angel destroys only a creature with less power than its own", () => {
    const { game } = table();
    lands(game, "Plains", 3);
    lands(game, "Swamp", 1);
    const saga = toHand(game, "Firja's Retribution");
    cast(game, saga);
    expect(tokensNamed(game, "Angel Warrior Token (Flying, Vigilance)")).toBe(1);
    const angel = spawn(game, "Serra Angel");
    const giant = spawn(game, "Hill Giant", B);
    const wurm = spawn(game, "Craw Wurm", B);
    nextTurn(game);
    nextTurn(game);
    settle(game);
    // Serra Angel is 4/4: Craw Wurm's 6 power isn't less than this
    // creature's power, though the Saga has none at all.
    expect(() => activate(game, angel, 0, { targets: [ref(wurm)] })).toThrow();
    activate(game, angel, 0, { targets: [ref(giant)] });
    expect(zone(game, giant)).toBe("graveyard");
    expect(zone(game, wurm)).toBe("battlefield");
    void A;
  });
});

describe("\"whenever this deals damage\" triggers once per damage event", () => {
  it("Armadillo Cloak: a trampler blocked deals damage to the blocker and the player at once — one trigger, the total", () => {
    const { game, a, b } = table();
    const bears = spawn(game, "Grizzly Bears");
    const blocker = spawn(game, "Grizzly Bears", B);
    lands(game, "Forest", 1);
    lands(game, "Plains", 2);
    cast(game, toHand(game, "Armadillo Cloak"), { targets: [ref(bears)] });
    // 4/4 trample, blocked by a 2/2: 2 to the blocker, 2 to bob.
    a.declareAttackersFn = () => [{ attacker: bears, defender: B }];
    b.declareBlockersFn = () => [{ blocker, attacker: bears }];
    expect(damageTriggers(game)).toBe(1);
    settle(game);
    expect(life(game, A)).toBe(24);
    expect(life(game, B)).toBe(18);
  });

  it("Ceremonial Knife: the granted \"deals combat damage\" trigger — a trampler's blocker and player are one event", () => {
    const { game, a, b } = table();
    const maw = spawn(game, "Colossal Dreadmaw");
    const blocker = spawn(game, "Grizzly Bears", B);
    const knife = spawn(game, "Ceremonial Knife");
    lands(game, "Plains", 2);
    activate(game, knife, 0, { targets: [ref(maw)] });
    a.declareAttackersFn = () => [{ attacker: maw, defender: B }];
    b.declareBlockersFn = () => [{ blocker, attacker: maw }];
    expect(damageTriggers(game)).toBe(1);
    settle(game);
    expect(tokensNamed(game, "Blood Token")).toBe(1);
    expect(life(game, B)).toBe(15);
  });

  it("Towering-Wave Mystic: target player mills as many cards as the damage it dealt", () => {
    const { game, a } = table();
    const mystic = spawn(game, "Towering-Wave Mystic");
    pickTargets(a, B);
    attack(game, a, [mystic]);
    expect(graveyard(game, B).length).toBe(2);
  });
});
