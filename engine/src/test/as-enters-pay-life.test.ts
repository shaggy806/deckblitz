/**
 * "As this artifact enters, pay any amount of life" (Phyrexian Processor —
 * `AsEntersAction.payLife`): a `choose-number` from 0 to its controller's life
 * total (rule 119.4), asked as it's about to enter (rule 614.12) and paid then
 * (614.1c); kept as the number it noted, read by "where X is the life paid as
 * this artifact entered" (`{ chosenNumber: true }`).
 */
import { describe, expect, it } from "vitest";

import type { ChooseNumberOffer } from "../controller.js";
import { A, activate, cast, lands, life, pt, settle, table, toHand, tokensNamed } from "./harness.js";

const MINION = "Phyrexian Minion Token (Black 0/0)";

describe("Phyrexian Processor", () => {
  it("pays the chosen life as it enters, and makes X/X Minions for that X", () => {
    const { game, a } = table({ life: 20 });
    lands(game, "Wastes", 8);
    const offers: ChooseNumberOffer[] = [];
    a.chooseNumberFn = (_view, offer) => {
      offers.push(offer);
      return 6;
    };
    const processor = toHand(game, "Phyrexian Processor");
    cast(game, processor);
    expect(offers).toHaveLength(1);
    expect([offers[0].min, offers[0].max]).toEqual([0, 20]);
    expect(life(game, A)).toBe(14);
    expect(game.state.objects[processor].chosenOnEnter).toBe("6");
    activate(game, processor, 0);
    settle(game);
    expect(tokensNamed(game, MINION)).toBe(1);
    const minion = game.state.zones.shared.battlefield.find((id) => game.state.objects[id].cardName === MINION)!;
    expect(pt(game, minion)).toEqual({ power: 6, toughness: 6 });
  });

  it("paying 0 is allowed (its ruling): its Minions are 0/0s that die", () => {
    const { game, a } = table();
    lands(game, "Wastes", 8);
    a.chooseNumberFn = () => 0;
    const processor = toHand(game, "Phyrexian Processor");
    const before = life(game, A);
    cast(game, processor);
    expect(life(game, A)).toBe(before);
    activate(game, processor, 0);
    settle(game);
    expect(tokensNamed(game, MINION)).toBe(0);
  });

  it("can't pay more than its controller's life total, and at 0 life it's never asked", () => {
    const { game, a } = table({ life: 3 });
    lands(game, "Wastes", 4);
    const offers: ChooseNumberOffer[] = [];
    a.chooseNumberFn = (_view, offer) => {
      offers.push(offer);
      return offer.max ?? 0;
    };
    cast(game, toHand(game, "Phyrexian Processor"));
    expect(offers.map((o) => o.max)).toEqual([3]);
    expect(life(game, A)).toBe(0);
  });
});
