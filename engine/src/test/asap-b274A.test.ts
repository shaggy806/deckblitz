/**
 * Flagged "Build ASAP" cards, B274 agent A: Heroic Sacrifice — a turn-long
 * redirection of all damage to you and creatures you control onto a chosen
 * creature (rule 614.9), and a delayed "when that creature dies this turn"
 * with a target of its own (rule 603.7c) putting its counters on another.
 */
import { describe, expect, it } from "vitest";

import type { Action, LegalAction } from "../actions.js";
import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import type { TargetRef } from "../target.js";
import {
  A,
  B,
  C,
  D,
  cast,
  controller,
  counters,
  destroy,
  hand,
  lands,
  life,
  nextTurn,
  pickTargets,
  ref,
  settle,
  spawn,
  table,
  toHand,
  toLibrary,
  toStep,
  zone,
} from "./harness.js";

/** `source` deals `amount` noncombat damage to `to`. */
const hit = (game: Game, source: ObjectId, to: TargetRef, amount: number): void =>
  game.debugApplyEffect(game.state.objects[source].controller, { kind: "damage", amount, target: 0 }, [to], { source });
const damage = (game: Game, id: ObjectId): number => game.state.objects[id].damageMarked;

function board() {
  const t = table();
  const { game } = t;
  const giant = spawn(game, "Hill Giant");
  const bears = spawn(game, "Grizzly Bears");
  const enemy = spawn(game, "Grizzly Bears", B);
  lands(game, "Plains", 2);
  cast(game, toHand(game, "Heroic Sacrifice"), { targets: [ref(giant)] });
  return { ...t, giant, bears, enemy };
}

describe("Heroic Sacrifice", () => {
  it("sends damage to you and your other creatures to the chosen creature this turn", () => {
    const { game, giant, bears, enemy } = board();
    hit(game, enemy, ref(A), 1);
    expect(life(game)).toBe(20);
    expect(damage(game, giant)).toBe(1);
    hit(game, enemy, ref(bears), 1);
    expect(damage(game, bears)).toBe(0);
    expect(damage(game, giant)).toBe(2);
    // An opponent's creature isn't covered.
    hit(game, bears, ref(enemy), 1);
    expect(damage(game, enemy)).toBe(1);
  });

  it("does nothing once the chosen creature has left, and ends with the turn", () => {
    const { game, giant, enemy } = board();
    destroy(game, giant);
    hit(game, enemy, ref(A), 2);
    expect(life(game)).toBe(18);

    const second = board();
    nextTurn(second.game);
    hit(second.game, second.enemy, ref(A), 2);
    expect(life(second.game)).toBe(18);
    expect(damage(second.game, second.giant)).toBe(0);
  });

  it("when the chosen creature dies, puts its counters on up to one target creature you control and draws", () => {
    const { game, a, giant, bears } = board();
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 2 }, [ref(giant)]);
    const before = hand(game).length;
    pickTargets(a, bears);
    destroy(game, giant);
    expect(zone(game, giant)).toBe("graveyard");
    expect(counters(game, bears)).toBe(2);
    expect(hand(game).length).toBe(before + 1);
  });

  it("still draws with no creature chosen for the counters", () => {
    const { game, a, giant, bears } = board();
    game.debugApplyEffect(A, { kind: "add-counter", target: 0, counter: "+1/+1", amount: 1 }, [ref(giant)]);
    const before = hand(game).length;
    pickTargets(a, null);
    destroy(game, giant);
    expect(counters(game, bears)).toBe(0);
    expect(hand(game).length).toBe(before + 1);
  });

  it("doesn't trigger when the chosen creature dies on a later turn", () => {
    const { game, a, giant, bears } = board();
    nextTurn(game);
    const before = hand(game).length;
    pickTargets(a, bears);
    destroy(game, giant);
    expect(hand(game).length).toBe(before);
  });
});

type Offer = Extract<LegalAction, { kind: "cast-now" }>;
type Cast = Extract<Action, { type: "cast-spell" }>;

/** The seat casts `want` in turn, by name, then declines, recording each offer. */
function casting(seat: ScriptedController, want: readonly string[]): Offer[] {
  const offers: Offer[] = [];
  const left = [...want];
  seat.chooseCastNowFn = (_view, offer): Cast | null => {
    offers.push(offer);
    const name = left.shift();
    if (name === undefined) return null;
    const way = offer.casts.find((c) => c.cardName === name);
    if (way === undefined) throw new Error(`${name} isn't on offer: ${offer.casts.map((c) => c.cardName).join(", ")}`);
    return { type: "cast-spell", player: A, card: way.card, targets: [], via: "effect", free: true };
  };
  return offers;
}
const offeredNames = (offer: Offer): readonly string[] => [...new Set(offer.casts.map((c) => c.cardName))].sort();

describe("Plargg and Nassari", () => {
  it("an opponent picks one nonland card exiled this way, and you may cast the others but not that one", () => {
    const { game, a, b } = table();
    spawn(game, "Plargg and Nassari");
    toStep(game, "upkeep");
    const divination = toLibrary(game, "Divination");
    const bears = toLibrary(game, "Grizzly Bears", B);
    const wastes = toLibrary(game, "Wastes", B);
    let seen: readonly ObjectId[] = [];
    b.chooseFromZoneFn = (_view, eligible) => {
      seen = eligible;
      return [divination];
    };
    const offers = casting(a, ["Grizzly Bears"]);
    settle(game);
    // Only the nonland cards are the opponent's to choose among.
    expect([...seen].sort()).toEqual([divination, bears].sort());
    expect(offers).toHaveLength(1);
    expect(offeredNames(offers[0])).toEqual(["Grizzly Bears"]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(controller(game, bears)).toBe(A);
    // The chosen card and the land stay in exile.
    expect(zone(game, divination)).toBe("exile");
    expect(zone(game, wastes)).toBe("exile");
  });

  it("with three opponents, you pick who chooses, and at most two spells are cast", () => {
    const { game, a, b, c, d } = table({ players: 4 });
    spawn(game, "Plargg and Nassari");
    toStep(game, "upkeep");
    const divination = toLibrary(game, "Divination");
    const bears = toLibrary(game, "Grizzly Bears", B);
    const giant = toLibrary(game, "Hill Giant", C);
    const whisper = toLibrary(game, "Night's Whisper", D);
    a.chooseModesFn = () => [1];
    const refuse = (): never => {
      throw new Error("the wrong opponent was asked");
    };
    b.chooseFromZoneFn = refuse;
    d.chooseFromZoneFn = refuse;
    c.chooseFromZoneFn = () => [divination];
    const offers = casting(a, ["Grizzly Bears", "Hill Giant"]);
    settle(game);
    expect(offers).toHaveLength(2);
    expect(offeredNames(offers[0])).toEqual(["Grizzly Bears", "Hill Giant", "Night's Whisper"]);
    expect(offers.map((o) => o.castsLeft)).toEqual([2, 1]);
    expect(zone(game, bears)).toBe("battlefield");
    expect(zone(game, giant)).toBe("battlefield");
    expect(zone(game, whisper)).toBe("exile");
    expect(zone(game, divination)).toBe("exile");
  });
});
