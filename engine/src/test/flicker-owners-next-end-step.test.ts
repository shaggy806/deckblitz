/**
 * A flicker whose card comes back at **its owner's** next end step
 * (`flicker`'s `returnOnOwnersTurn`): The Eternal Wanderer's +1, "return that
 * card to the battlefield under its owner's control at the beginning of that
 * player's next end step" — and the rest of the Wanderer.
 */
import { describe, expect, it } from "vitest";
import type { ObjectId, PlayerId } from "../primitives.js";
import {
  A,
  B,
  C,
  controller,
  keywords,
  loyalty,
  named,
  nextTurn,
  ref,
  settle,
  spawn,
  table,
  toStep,
  zone,
} from "./harness.js";
import { activePlayerOf } from "../state.js";

describe("The Eternal Wanderer", () => {
  it("+1 on an opponent's creature: back at that player's next end step, not this turn's", () => {
    const { game } = table();
    const wanderer = spawn(game, "The Eternal Wanderer");
    const bears = spawn(game, "Grizzly Bears", B);
    loyalty(game, wanderer, 1, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    // Alice's own end step passes it by.
    toStep(game, "end");
    game.advanceUntil((s) => s.turn.number === 2 && s.turn.step === "upkeep");
    expect(zone(game, bears)).toBe("exile");
    // Bob's end step brings it back, under Bob.
    toStep(game, "end", B);
    settle(game);
    const back = named(game, "Grizzly Bears", B);
    expect(back).toHaveLength(1);
    expect(controller(game, back[0])).toBe(B);
  });

  it("+1 on its controller's own creature: back at this turn's end step", () => {
    const { game } = table();
    const wanderer = spawn(game, "The Eternal Wanderer");
    const bears = spawn(game, "Grizzly Bears");
    loyalty(game, wanderer, 1, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    toStep(game, "end");
    game.advanceUntil((s) => s.turn.step === "cleanup" || s.turn.number === 2);
    expect(game.state.turn.number).toBe(1);
    expect(named(game, "Grizzly Bears", A)).toHaveLength(1);
  });

  it("an opponent's card under another opponent's control returns at its owner's end step, to its owner", () => {
    const { game } = table({ players: 3 });
    const wanderer = spawn(game, "The Eternal Wanderer");
    // Bob owns it; Carol controls it.
    const bears = spawn(game, "Grizzly Bears", B);
    game.state.objects[bears].controller = C;
    loyalty(game, wanderer, 1, { targets: [ref(bears)] });
    expect(zone(game, bears)).toBe("exile");
    nextTurn(game);
    expect(activePlayerOf(game.state)).toBe(B);
    toStep(game, "end", B);
    settle(game);
    const back = named(game, "Grizzly Bears", B);
    expect(back).toHaveLength(1);
    expect(controller(game, back[0])).toBe(B);
  });

  it("0: a 2/2 white Samurai with double strike", () => {
    const { game } = table();
    const wanderer = spawn(game, "The Eternal Wanderer");
    loyalty(game, wanderer, 0);
    const [samurai] = named(game, "Samurai Token (The Eternal Wanderer)", A);
    expect(samurai).toBeDefined();
    expect(keywords(game, samurai).has("double-strike")).toBe(true);
  });

  it("−4: you choose one creature each player keeps; the rest are sacrificed", () => {
    const { game, a } = table();
    const wanderer = spawn(game, "The Eternal Wanderer");
    const mine = spawn(game, "Grizzly Bears");
    const bears = spawn(game, "Grizzly Bears", B);
    const giant = spawn(game, "Hill Giant", B);
    const asked: (readonly ObjectId[])[] = [];
    a.choosePermanentsFn = (_view, eligible) => {
      asked.push(eligible);
      return eligible.includes(giant) ? [giant] : [eligible[0]];
    };
    loyalty(game, wanderer, -4, { atLeast: 4 });
    // Alice has one creature: kept without asking. Bob's are asked about.
    expect(asked).toHaveLength(1);
    expect(asked[0]).toContain(bears);
    expect(asked[0]).toContain(giant);
    expect(zone(game, mine)).toBe("battlefield");
    expect(zone(game, giant)).toBe("battlefield");
    expect(zone(game, bears)).toBe("graveyard");
  });

  it("no more than one creature can attack it each combat", () => {
    const { game } = table();
    const wanderer = spawn(game, "The Eternal Wanderer", B);
    const one = spawn(game, "Grizzly Bears");
    const two = spawn(game, "Hill Giant");
    game.advanceUntil((s) => s.awaiting?.kind === "attackers");
    const declare = (attackers: readonly { attacker: ObjectId; defender: PlayerId | ObjectId }[]): string | null =>
      game.canDispatch({ type: "declare-attackers", player: A, attackers });
    expect(
      declare([
        { attacker: one, defender: wanderer },
        { attacker: two, defender: wanderer },
      ]),
    ).toMatch(/No more than one creature can attack /);
    expect(
      declare([
        { attacker: one, defender: wanderer },
        { attacker: two, defender: B },
      ]),
    ).toBeNull();
  });
});
