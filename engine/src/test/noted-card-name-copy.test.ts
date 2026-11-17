/**
 * A card name noted on a permanent and a copy made of it (rule 707.14) —
 * Magar of the Magic Strings: "Note the name of target instant or sorcery
 * card in your graveyard and put it onto the battlefield face down. It's a
 * 3/3 creature with 'Whenever this creature deals combat damage to a player,
 * you may create a copy of the card with the noted name. You may cast the
 * copy without paying its mana cost' and 'If this creature would leave the
 * battlefield, exile it instead of putting it anywhere else.'"
 *
 * `put-onto-battlefield`'s `noteName` (`GameObject.notedName`), the face-down
 * 3/3 an internal definition (`FaceDownAs`), `cast-now`'s `copyOfCardNamed:
 * { noted: "source" }` and `StaticAbility.exileIfLeaves`.
 */
import { describe, expect, it } from "vitest";

import { computeCharacteristics } from "../characteristics.js";
import type { ScriptedController } from "../controller.js";
import type { Game } from "../game.js";
import type { ObjectId } from "../primitives.js";
import { nameOf } from "../state.js";
import type { TargetRef } from "../target.js";
import {
  A,
  B,
  activate,
  attack,
  cast,
  destroy,
  lands,
  life,
  pt,
  ref,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  zone,
} from "./harness.js";

/** Cast each copy offered (free), or decline; records the cards offered. */
function casting(seat: ScriptedController, yes: boolean, targets: readonly TargetRef[] = []): string[] {
  const offers: string[] = [];
  seat.chooseCastNowFn = (_view, offer) => {
    offers.push(offer.casts[0].cardName);
    return yes
      ? { type: "cast-spell", player: seat.playerId, card: offer.casts[0].card, targets: [...targets], via: offer.casts[0].via, free: true }
      : null;
  };
  return offers;
}

/** Magar on alice's side, its ability activated at the graveyard card `card`. */
function noteAndPut(game: Game, card: ObjectId): void {
  const magar = spawn(game, "Magar of the Magic Strings", A);
  lands(game, "Swamp", 2);
  lands(game, "Mountain", 1);
  activate(game, magar, 0, { targets: [ref(card)] });
}

const ready = (game: Game, id: ObjectId): void => {
  game.state.objects[id].summoningSick = false;
};

describe("Magar of the Magic Strings", () => {
  it("puts the instant onto the battlefield face down as a nameless colorless 3/3, its name noted", () => {
    const { game } = table();
    const bolt = toGraveyard(game, "Lightning Bolt", A);
    noteAndPut(game, bolt);
    expect(zone(game, bolt)).toBe("battlefield");
    const object = game.state.objects[bolt];
    expect(object.faceDown?.as).toBe("3/3 creature that copies the noted card");
    expect(object.notedName).toBe("Lightning Bolt");
    expect(pt(game, bolt)).toEqual({ power: 3, toughness: 3 });
    const c = computeCharacteristics(game.state, game.registry, bolt);
    expect(c.types).toEqual(["creature"]);
    expect([...(c.colors ?? [])]).toEqual([]);
    expect(nameOf(object)).not.toBe("Lightning Bolt");
  });

  it("dealing combat damage to a player, it offers a free copy of the noted card", () => {
    const { game, a } = table();
    const bolt = toGraveyard(game, "Lightning Bolt", A);
    noteAndPut(game, bolt);
    ready(game, bolt);
    const offers = casting(a, true, [ref(B)]);
    attack(game, a, [bolt]);
    expect(offers).toEqual(["Lightning Bolt"]);
    // 3 combat damage, then the copy's 3, its mana cost unpaid.
    expect(life(game, B)).toBe(14);
    expect(game.battlefield.filter((id) => game.state.objects[id].tapped && game.state.objects[id].cardName !== "Lightning Bolt")).toHaveLength(3);
    // The copy is gone; the face-down card is still there, face down.
    expect(Object.values(game.state.objects).filter((o) => o.cardName === "Lightning Bolt")).toHaveLength(1);
    expect(game.state.objects[bolt].faceDown).toBeDefined();
  });

  it("gone before its trigger resolves, the copy is of the name it last had noted", () => {
    const { game, a } = table();
    const bolt = toGraveyard(game, "Lightning Bolt", A);
    noteAndPut(game, bolt);
    ready(game, bolt);
    const offers = casting(a, true, [ref(B)]);
    a.declareAttackersFn = () => [{ attacker: bolt, defender: B }];
    game.advanceUntil((s) => s.zones.shared.stack.length > 0);
    destroy(game, bolt);
    expect(zone(game, bolt)).toBe("exile");
    toStep(game, "postcombat-main");
    expect(offers).toEqual(["Lightning Bolt"]);
    expect(life(game, B)).toBe(14);
  });

  it("the copy may be declined", () => {
    const { game, a } = table();
    const bolt = toGraveyard(game, "Lightning Bolt", A);
    noteAndPut(game, bolt);
    ready(game, bolt);
    const offers = casting(a, false);
    attack(game, a, [bolt]);
    expect(offers).toEqual(["Lightning Bolt"]);
    expect(life(game, B)).toBe(17);
  });

  it("exiled instead of going anywhere else — destroyed, or bounced", () => {
    const { game } = table();
    const bolt = toGraveyard(game, "Lightning Bolt", A);
    noteAndPut(game, bolt);
    destroy(game, bolt);
    expect(zone(game, bolt)).toBe("exile");
    expect(game.state.objects[bolt].notedName).toBeUndefined();

    const divination = toGraveyard(game, "Divination", A);
    noteAndPut(game, divination);
    lands(game, "Island", 1);
    cast(game, toHand(game, "Unsummon"), { targets: [ref(divination)] });
    expect(zone(game, divination)).toBe("exile");
  });

  it("having lost its abilities, it goes to the graveyard as anything would", () => {
    const { game } = table();
    const bolt = toGraveyard(game, "Lightning Bolt", A);
    noteAndPut(game, bolt);
    lands(game, "Island", 2);
    cast(game, toHand(game, "Turn to Frog"), { targets: [ref(bolt)] });
    destroy(game, bolt);
    expect(zone(game, bolt)).toBe("graveyard");
  });

  it("a Clone of it is the 3/3 with both abilities but no noted name, so it copies nothing", () => {
    const { game, a } = table();
    const bolt = toGraveyard(game, "Lightning Bolt", A);
    noteAndPut(game, bolt);
    lands(game, "Island", 4);
    a.chooseCopyFn = () => bolt;
    const clone = toHand(game, "Clone");
    cast(game, clone);
    expect(zone(game, clone)).toBe("battlefield");
    expect(pt(game, clone)).toEqual({ power: 3, toughness: 3 });
    expect(game.state.objects[clone].notedName).toBeUndefined();
    ready(game, clone);
    const offers = casting(a, true, [ref(B)]);
    attack(game, a, [clone]);
    expect(offers).toEqual([]);
    expect(life(game, B)).toBe(17);
    // The copied leave-the-battlefield replacement is its own too.
    destroy(game, clone);
    expect(zone(game, clone)).toBe("exile");
  });
});
