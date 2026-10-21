/**
 * Ikoria: Lair of Behemoths, group a. One test (or two) per card, on its
 * riskiest clause and the edge its rulings call out.
 */
import { describe, expect, it } from "vitest";

import {
  A,
  B,
  activate,
  attack,
  cast,
  counters,
  enter,
  grant,
  hand,
  keywords,
  lands,
  life,
  named,
  pickTargets,
  pt,
  ref,
  settle,
  spawn,
  table,
  toGraveyard,
  toHand,
  toStep,
  watchTargets,
  zone,
} from "./harness.js";

describe("Void Beckoner", () => {
  it("when cycled, puts a deathtouch counter on target creature you control, and draws", () => {
    const { game, a } = table();
    lands(game, "Swamp", 3);
    const bears = spawn(game, "Grizzly Bears");
    const beckoner = toHand(game, "Void Beckoner");
    const before = hand(game).length;
    pickTargets(a, bears);
    game.dispatch({ type: "cycle", player: A, card: beckoner });
    settle(game);
    expect(zone(game, beckoner)).toBe("graveyard");
    expect(counters(game, bears, "deathtouch")).toBe(1);
    expect(keywords(game, bears).has("deathtouch")).toBe(true);
    expect(hand(game).length).toBe(before);
  });
});

describe("Serrated Scorpion", () => {
  it("dies: 2 damage to each opponent and you gain 2", () => {
    const { game } = table({ players: 3 });
    const scorpion = spawn(game, "Serrated Scorpion");
    game.debugApplyEffect(B, { kind: "destroy", target: 0 }, [ref(scorpion)]);
    settle(game);
    expect(life(game, A)).toBe(22);
    expect(life(game, B)).toBe(18);
    expect(life(game, "carol" as typeof A)).toBe(18);
  });
});

describe("Unexpected Fangs", () => {
  it("puts a +1/+1 counter and a lifelink counter on the target", () => {
    const { game, a } = table();
    lands(game, "Swamp", 2);
    const bears = spawn(game, "Grizzly Bears");
    pickTargets(a, bears);
    cast(game, toHand(game, "Unexpected Fangs"), { targets: [ref(bears)] });
    expect(pt(game, bears)).toEqual({ power: 3, toughness: 3 });
    expect(keywords(game, bears).has("lifelink")).toBe(true);
  });
});

describe("Inspired Ultimatum", () => {
  it("target player gains 5, 5 damage to any target, then you draw five", () => {
    const { game } = table();
    lands(game, "Island", 2);
    lands(game, "Mountain", 3);
    lands(game, "Plains", 2);
    const card = toHand(game, "Inspired Ultimatum");
    const before = hand(game).length;
    cast(game, card, { targets: [ref(A), ref(B)] });
    expect(life(game, A)).toBe(25);
    expect(life(game, B)).toBe(15);
    expect(hand(game).length).toBe(before - 1 + 5);
  });
});

describe("Ferocious Tigorilla / Helica Glider", () => {
  it("enters with the chosen counter only", () => {
    const { game, a } = table();
    lands(game, "Mountain", 4);
    a.chooseCreatureTypeFn = () => "menace";
    const tigorilla = toHand(game, "Ferocious Tigorilla");
    cast(game, tigorilla);
    expect(counters(game, tigorilla, "menace")).toBe(1);
    expect(counters(game, tigorilla, "trample")).toBe(0);
    expect(keywords(game, tigorilla).has("menace")).toBe(true);
  });

  it("Helica Glider: first strike chosen", () => {
    const { game, a } = table();
    lands(game, "Plains", 3);
    a.chooseCreatureTypeFn = () => "first strike";
    const glider = toHand(game, "Helica Glider");
    cast(game, glider);
    expect(counters(game, glider, "first-strike")).toBe(1);
    expect(counters(game, glider, "flying")).toBe(0);
    expect(keywords(game, glider).has("first-strike")).toBe(true);
  });
});

describe("Of One Mind", () => {
  it("costs {2} less with a Human and a non-Human creature", () => {
    const { game } = table();
    lands(game, "Island", 1);
    spawn(game, "Elite Vanguard");
    spawn(game, "Grizzly Bears");
    const card = toHand(game, "Of One Mind");
    const before = hand(game).length;
    cast(game, card);
    expect(hand(game).length).toBe(before - 1 + 2);
  });

  it("costs full with two Humans and no non-Human", () => {
    const { game } = table();
    lands(game, "Island", 1);
    spawn(game, "Elite Vanguard");
    spawn(game, "Elite Vanguard");
    expect(() => cast(game, toHand(game, "Of One Mind"))).toThrow();
  });
});

describe("Slitherwisp", () => {
  it("triggers on a spell with flash, not on one without", () => {
    const { game } = table();
    lands(game, "Island", 2);
    lands(game, "Forest", 2);
    spawn(game, "Slitherwisp");
    const before = hand(game).length;
    cast(game, toHand(game, "Grizzly Bears"));
    expect(life(game, B)).toBe(20);
    expect(hand(game).length).toBe(before);
    const sailor = toHand(game, "Spectral Sailor");
    const withSailor = hand(game).length;
    cast(game, sailor);
    expect(life(game, B)).toBe(19);
    expect(hand(game).length).toBe(withSailor - 1 + 1);
  });
});

describe("Gust of Wind", () => {
  it("costs {2} less with a flier; bounces and draws", () => {
    const { game, a } = table();
    lands(game, "Island", 2);
    spawn(game, "Spectral Sailor");
    const theirs = spawn(game, "Grizzly Bears", B);
    const card = toHand(game, "Gust of Wind");
    const before = hand(game).length;
    pickTargets(a, theirs);
    cast(game, card, { targets: [ref(theirs)] });
    expect(zone(game, theirs)).toBe("hand");
    expect(hand(game).length).toBe(before - 1 + 1);
  });

  it("without a flier, two lands can't pay for it", () => {
    const { game } = table();
    lands(game, "Island", 2);
    const theirs = spawn(game, "Grizzly Bears", B);
    expect(() => cast(game, toHand(game, "Gust of Wind"), { targets: [ref(theirs)] })).toThrow();
  });
});

describe("Solid Footing", () => {
  it("a vigilant enchanted creature assigns combat damage equal to its toughness", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    const mentor = spawn(game, "Keensight Mentor");
    grant(game, mentor, "vigilance");
    cast(game, toHand(game, "Solid Footing"), { targets: [ref(mentor)] });
    expect(pt(game, mentor)).toEqual({ power: 2, toughness: 5 });
    attack(game, a, [mentor]);
    expect(life(game, B)).toBe(15);
  });

  it("without vigilance it assigns damage equal to its power", () => {
    const { game, a } = table();
    lands(game, "Plains", 1);
    const mentor = spawn(game, "Keensight Mentor");
    cast(game, toHand(game, "Solid Footing"), { targets: [ref(mentor)] });
    attack(game, a, [mentor]);
    expect(life(game, B)).toBe(18);
  });
});

describe("Frondland Felidar", () => {
  it("grants the tap ability to creatures you control with vigilance only", () => {
    const { game } = table();
    lands(game, "Wastes", 2);
    const felidar = spawn(game, "Frondland Felidar");
    const bears = spawn(game, "Grizzly Bears");
    const theirs = spawn(game, "Hill Giant", B);
    expect(() => activate(game, bears, 0, { targets: [ref(theirs)] })).toThrow();
    activate(game, felidar, 0, { targets: [ref(theirs)] });
    expect(game.state.objects[theirs].tapped).toBe(true);
    grant(game, bears, "vigilance");
    const other = spawn(game, "Hill Giant", B);
    activate(game, bears, 0, { targets: [ref(other)] });
    expect(game.state.objects[other].tapped).toBe(true);
  });
});

describe("Offspring's Revenge", () => {
  it("at your beginning of combat, exiles a R/W/B creature card and makes a 1/1 hasty token copy", () => {
    const { game, a } = table();
    spawn(game, "Offspring's Revenge");
    const giant = toGraveyard(game, "Hill Giant");
    const bears = toGraveyard(game, "Grizzly Bears");
    const vanguard = toGraveyard(game, "Elite Vanguard");
    const seen = watchTargets(a, (offered) => {
      expect(offered[0]).toContain(giant);
      expect(offered[0]).toContain(vanguard);
      expect(offered[0]).not.toContain(bears);
      return [giant];
    });
    toStep(game, "begin-combat");
    settle(game);
    expect(seen.asked).toBe(1);
    expect(zone(game, giant)).toBe("exile");
    const tokens = named(game, "Hill Giant", A).filter((id) => game.state.objects[id].isToken);
    expect(tokens).toHaveLength(1);
    expect(pt(game, tokens[0])).toEqual({ power: 1, toughness: 1 });
    expect(keywords(game, tokens[0]).has("haste")).toBe(true);
  });
});

describe("Keensight Mentor", () => {
  it("ETB vigilance counter on a non-Human; the pump hits only vigilant creatures", () => {
    const { game, a } = table();
    lands(game, "Plains", 2);
    const bears = spawn(game, "Grizzly Bears");
    const human = spawn(game, "Elite Vanguard");
    const giant = spawn(game, "Hill Giant");
    const seen = watchTargets(a, (offered) => {
      expect(offered[0]).toContain(giant);
      expect(offered[0]).not.toContain(human);
      return [bears];
    });
    const mentor = enter(game, "Keensight Mentor");
    expect(seen.asked).toBe(1);
    expect(counters(game, bears, "vigilance")).toBe(1);
    activate(game, mentor, 0);
    expect(counters(game, bears)).toBe(1);
    expect(counters(game, human)).toBe(0);
    expect(counters(game, giant)).toBe(0);
    expect(counters(game, mentor)).toBe(0);
  });
});

describe("Springjaw Trap", () => {
  it("{4}, {T}, sacrifice: 3 damage to any target", () => {
    const { game } = table();
    lands(game, "Wastes", 4);
    const trap = spawn(game, "Springjaw Trap");
    activate(game, trap, 0, { targets: [ref(B)] });
    expect(life(game, B)).toBe(17);
    expect(zone(game, trap)).toBe("graveyard");
  });
});
