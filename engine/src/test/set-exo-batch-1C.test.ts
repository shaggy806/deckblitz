import { describe, expect, it } from "vitest";
import {
  A,
  B,
  activate,
  blockOffer,
  cast,
  counters,
  grant,
  hand,
  lands,
  life,
  nextTurn,
  pt,
  ref,
  spawn,
  table,
  toHand,
  toStep,
  types,
  zone,
} from "./harness.js";

describe("Exodus batch 1C", () => {
  it("Necrologia is cast only during your end step, paying X life to draw X", () => {
    const { game } = table();
    lands(game, "Swamp", 5);
    const necrologia = toHand(game, "Necrologia");
    expect(() => cast(game, necrologia, { x: 3 })).toThrow();
    toStep(game, "end");
    const before = hand(game).length;
    cast(game, necrologia, { x: 3 });
    expect(life(game)).toBe(17);
    expect(hand(game).length).toBe(before - 1 + 3);
  });

  it("Predatory Hunger grows the enchanted creature when an opponent casts a creature spell", () => {
    const { game } = table();
    lands(game, "Forest", 1);
    const bears = spawn(game, "Grizzly Bears");
    cast(game, toHand(game, "Predatory Hunger"), { targets: [ref(bears)] });
    // Alice's own creature spell doesn't count.
    lands(game, "Forest", 2);
    cast(game, toHand(game, "Grizzly Bears"));
    expect(counters(game, bears)).toBe(0);
    nextTurn(game);
    lands(game, "Forest", 2, B);
    cast(game, toHand(game, "Grizzly Bears", B), { player: B });
    expect(counters(game, bears)).toBe(1);
  });

  it("Dauthi Warlord's power counts every creature with shadow, any controller's", () => {
    const { game } = table();
    const warlord = spawn(game, "Dauthi Warlord");
    expect(pt(game, warlord)).toEqual({ power: 1, toughness: 1 });
    const theirs = spawn(game, "Grizzly Bears", B);
    grant(game, theirs, "shadow");
    spawn(game, "Grizzly Bears");
    expect(pt(game, warlord)).toEqual({ power: 2, toughness: 1 });
  });

  it("Transmogrifying Licid's Aura gives +1/+1 and makes the creature an artifact", () => {
    const { game } = table();
    lands(game, "Wastes", 1);
    const licid = spawn(game, "Transmogrifying Licid");
    const bears = spawn(game, "Grizzly Bears");
    activate(game, licid, 0, { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(types(game, bears)).toContain("artifact");
    expect(types(game, bears)).toContain("creature");
  });

  it("Song of Serenity stops enchanted creatures blocking, and only them", () => {
    const { game, a } = table();
    lands(game, "Forest", 1);
    spawn(game, "Song of Serenity");
    const enchanted = spawn(game, "Grizzly Bears", B);
    const plain = spawn(game, "Grizzly Bears", B);
    cast(game, toHand(game, "Predatory Hunger"), { targets: [ref(enchanted)] });
    const attacker = spawn(game, "Grizzly Bears");
    const offer = blockOffer(game, a, [attacker]);
    const blockers = offer.eligible.filter((e) => e.canBlock.includes(attacker)).map((e) => e.blocker);
    expect(blockers).toContain(plain);
    expect(blockers).not.toContain(enchanted);
  });

  it("Convalescence gains 1 life at 10 or less, nothing above", () => {
    const { game } = table();
    spawn(game, "Convalescence");
    game.state.players[A].life = 10;
    toStep(game, "draw");
    expect(life(game)).toBe(11);
    toStep(game, "draw");
    expect(life(game)).toBe(11);
  });

  it("Mirozel returns to its owner's hand when targeted, and the spell fizzles", () => {
    const { game } = table();
    lands(game, "Mountain", 1);
    const mirozel = spawn(game, "Mirozel", B);
    cast(game, toHand(game, "Shock"), { targets: [ref(mirozel)] });
    const card = hand(game, B).find((id) => game.state.objects[id].cardName === "Mirozel");
    expect(card).toBeDefined();
    expect(zone(game, mirozel)).not.toBe("battlefield");
  });
});
